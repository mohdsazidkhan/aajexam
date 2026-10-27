'use client';
import Select from '../common/ui/Select';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { m as motion, AnimatePresence } from 'framer-motion';
import { UserRound, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import { getCurrentUser } from '../../lib/utils/authUtils';
import useTranslate from '../../hooks/useTranslate';
import { QUALIFICATIONS, GENDERS, HEARD_FROM, MIN_AGE_YEARS, MAX_AGE_YEARS } from '../../lib/constants/profileOptions';
import { calcAge } from '../../lib/utils/age';

// Asks a signed-in student for the optional "About you" details (qualification, date of birth, gender,
// how they found AajExam) when any of them is still empty. Gentle by design:
//   - once per browser session, after the city / target-exam prompt has been dealt with (never stacked on it)
//   - never while a test or quiz is being attempted
//   - Skip / close: asked again only after RE_ASK_DAYS, and never after MAX_SKIPS skips
// What was already answered is never asked again. The same fields live in Settings -> Profile.
const RE_ASK_DAYS = 7;
const MAX_SKIPS = 3;
const FIELDS = ['qualification', 'dateOfBirth', 'gender', 'heardFrom'];
const TEST_ROUTE = /\/(attempt|start)$/; // /quiz/[id]/attempt, /govt-exams/test/[testId]/start
const FALLBACK_WAIT_MS = 20000;

const FIELD_CLASSNAME = 'w-full px-3 py-2.5 rounded-xl border border-border-primary bg-background-surface-secondary text-sm font-bold outline-none focus:border-primary-700 transition-all';

const readState = (uid) => {
  try { return JSON.parse(localStorage.getItem(`profileDetails:${uid}`)) || {}; } catch { return {}; }
};
const writeState = (uid, state) => {
  try { localStorage.setItem(`profileDetails:${uid}`, JSON.stringify(state)); } catch { /* storage blocked: asked again next session */ }
};
const toDateInput = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const ProfileDetailsModal = () => {
  const { translate } = useTranslate();
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ qualification: '', dateOfBirth: '', gender: '', heardFrom: '' });
  const userIdRef = useRef(null);

  const age = useMemo(() => calcAge(form.dateOfBirth), [form.dateOfBirth]);
  const dobBounds = useMemo(() => {
    const now = new Date();
    return {
      min: toDateInput(new Date(now.getFullYear() - MAX_AGE_YEARS, now.getMonth(), now.getDate())),
      max: toDateInput(new Date(now.getFullYear() - MIN_AGE_YEARS, now.getMonth(), now.getDate())),
    };
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role === 'admin') return undefined;
    const uid = user._id || user.id || user.email;
    userIdRef.current = uid;

    const saved = readState(uid);
    if (saved.done || (saved.skips || 0) >= MAX_SKIPS) return undefined;
    if (saved.lastAskedAt && Date.now() - saved.lastAskedAt < RE_ASK_DAYS * 86400000) return undefined;
    if (sessionStorage.getItem('profileDetailsShown')) return undefined;

    let cancelled = false;
    let showTimer;
    let fallbackTimer;
    let onCityClosed;

    const open = () => {
      showTimer = setTimeout(() => {
        // Not in the middle of a test, and not on top of another modal.
        if (cancelled || TEST_ROUTE.test(routerRef.current.pathname) || window.__cityPromptOpen) return;
        sessionStorage.setItem('profileDetailsShown', 'true');
        setShow(true);
      }, 1500);
    };

    API.getProfile().then((res) => {
      if (cancelled) return;
      const u = res?.success ? res.user : null;
      if (!u) return;
      if (FIELDS.every((key) => !!u[key])) {
        writeState(uid, { ...saved, done: true });
        return;
      }
      setForm({
        qualification: u.qualification || '',
        gender: u.gender || '',
        heardFrom: u.heardFrom || '',
        dateOfBirth: u.dateOfBirth ? String(u.dateOfBirth).slice(0, 10) : '',
      });

      // The city / target-exam prompt goes first: wait for it to close instead of stacking on it.
      const hasExamChoice = (u.targetExams?.length > 0) || (u.primaryTargetExam && u.primaryTargetExam !== 'All Exams');
      const cityPending = !sessionStorage.getItem('cityPromptShown') && (!u.city || (!u.targetExamsPrompted && !hasExamChoice));
      if (cityPending || window.__cityPromptOpen) {
        onCityClosed = () => { clearTimeout(fallbackTimer); open(); };
        window.addEventListener('cityPrompt:closed', onCityClosed, { once: true });
        // If that prompt never appears (offline, error), do not wait for it forever.
        fallbackTimer = setTimeout(() => {
          if (window.__cityPromptOpen) return;
          window.removeEventListener('cityPrompt:closed', onCityClosed);
          open();
        }, FALLBACK_WAIT_MS);
      } else {
        open();
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
      clearTimeout(showTimer);
      clearTimeout(fallbackTimer);
      if (onCityClosed) window.removeEventListener('cityPrompt:closed', onCityClosed);
    };
  }, []);

  // Close or Skip: remember it, ask again only after a week, and stop after a few skips.
  const handleSkip = () => {
    const uid = userIdRef.current;
    if (uid) {
      const saved = readState(uid);
      writeState(uid, { ...saved, skips: (saved.skips || 0) + 1, lastAskedAt: Date.now() });
    }
    setShow(false);
  };

  const hasAnyValue = FIELDS.some((key) => !!form[key]);

  const handleSave = async () => {
    const payload = {};
    FIELDS.forEach((key) => { if (form[key]) payload[key] = form[key]; });
    if (!Object.keys(payload).length) return;
    if (payload.dateOfBirth && !age) {
      toast.error(translate('Please enter a valid date of birth.'));
      return;
    }
    if (payload.dateOfBirth && (age.years < MIN_AGE_YEARS || age.years > MAX_AGE_YEARS)) {
      toast.error(translate('Please enter a valid date of birth.'));
      return;
    }

    setSaving(true);
    try {
      const res = await API.updateProfile(payload);
      if (res?.success) {
        const stored = getCurrentUser();
        if (stored) localStorage.setItem('userInfo', JSON.stringify({ ...stored, ...payload }));
        const uid = userIdRef.current;
        if (uid) {
          const saved = readState(uid);
          const complete = FIELDS.every((key) => !!form[key]);
          // Everything answered: done for good. Partly answered: ask for the rest after a week.
          writeState(uid, complete ? { ...saved, done: true } : { ...saved, lastAskedAt: Date.now() });
        }
        toast.success(translate('Details saved!'));
        setShow(false);
      } else {
        toast.error(res?.message || translate('Failed to save'));
      }
    } catch (err) {
      toast.error(err?.message || translate('Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  const label = 'text-[11px] font-bold uppercase tracking-[0.08em] text-content-muted px-1';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={handleSkip}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-background-surface rounded-3xl border border-primary-500/20 p-5 sm:p-6"
        >
          <button
            aria-label={translate('Close')}
            onClick={handleSkip}
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-background-surface-secondary text-content-muted hover:text-content-primary dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-white dark:border-slate-800">
            <UserRound className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-lg font-bold font-outfit tracking-tight text-content-primary mb-1 text-center">
            {translate('Tell us about yourself')}
          </h2>
          <p className="text-xs font-bold text-content-secondary mb-4 text-center">
            {translate('Optional. This helps us personalise your preparation.')}
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className={label}>{translate('Qualification')}</label>
              <Select className={FIELD_CLASSNAME} value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })}>
                <option value="">{translate('Select qualification')}</option>
                {QUALIFICATIONS.map((o) => <option key={o.value} value={o.value}>{translate(o.label)}</option>)}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={label}>{translate('Gender')}</label>
                <Select className={FIELD_CLASSNAME} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">{translate('Select gender')}</option>
                  {GENDERS.map((o) => <option key={o.value} value={o.value}>{translate(o.label)}</option>)}
                </Select>
              </div>
              <div className="space-y-1 min-w-0">
                <label className={label}>{translate('Date of birth')}</label>
                <input
                  type="date"
                  className={`${FIELD_CLASSNAME} min-w-0 max-w-full min-h-[2.75rem] appearance-none`}
                  min={dobBounds.min}
                  max={dobBounds.max}
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            {age && (
              <div className="flex items-center justify-center gap-2 text-center">
                {[
                  { value: age.years, name: 'Years' },
                  { value: age.months, name: 'Months' },
                  { value: age.days, name: 'Days' },
                ].map((part) => (
                  <div key={part.name} className="flex-1 px-2 py-1.5 rounded-xl bg-background-surface-secondary">
                    <div className="text-base font-bold text-content-primary leading-none">{part.value}</div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted mt-0.5">{translate(part.name)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1">
              <label className={label}>{translate('How did you hear about us?')}</label>
              <Select className={FIELD_CLASSNAME} value={form.heardFrom} onChange={(e) => setForm({ ...form, heardFrom: e.target.value })}>
                <option value="">{translate('Select an option')}</option>
                {HEARD_FROM.map((o) => <option key={o.value} value={o.value}>{o.brand ? o.label : translate(o.label)}</option>)}
              </Select>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !hasAnyValue}
            className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-on-primary font-bold uppercase tracking-[0.08em] rounded-2xl hover:bg-primary-700 transition disabled:opacity-60 border-b-2 border-primary-800 active:border-b-0 active:translate-y-1"
          >
            {saving ? translate('Saving...') : translate('Save details')}
          </button>
          <button
            onClick={handleSkip}
            className="w-full mt-2 text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] hover:text-content-primary dark:hover:text-slate-300 transition"
          >
            {translate('Skip')}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileDetailsModal;
