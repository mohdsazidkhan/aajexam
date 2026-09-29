'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Target, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import { getCurrentUser } from '../../lib/utils/authUtils';
import StateCitySelect from '../StateCitySelect';
import { notifyTargetExamsChanged } from '../../lib/utils/targetExams';

// Nudges any logged-in user with no city on file to add one, and asks (once, ever)
// for their target exams — shown once per browser session (not every page load)
// so it's a gentle reminder, not a wall.
const CityPromptModal = () => {
  const [show, setShow] = useState(false);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [needCity, setNeedCity] = useState(false);
  const [needExams, setNeedExams] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExamIds, setSelectedExamIds] = useState([]); // empty = All Exams

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    if (sessionStorage.getItem('cityPromptShown')) return;

    // The cached localStorage user (set at login/register) doesn't carry
    // `city` at all, so it's never a reliable signal either way — always
    // confirm against the live profile before deciding to show this.
    let cancelled = false;
    let timer;
    API.getProfile().then((res) => {
      if (cancelled) return;
      const u = res?.success ? res.user : null;
      if (!u) return;
      const hasExamChoice = (u.targetExams?.length > 0) || (u.primaryTargetExam && u.primaryTargetExam !== 'All Exams');
      const askCity = !u.city;
      const askExams = !u.targetExamsPrompted && !hasExamChoice;
      if (askCity || askExams) {
        setNeedCity(askCity);
        setNeedExams(askExams);
        if (askExams) {
          API.getAllExams().then((r) => { if (!cancelled && r?.success) setExams(r.data || []); }).catch(() => {});
        }
        timer = setTimeout(() => {
          setShow(true);
          sessionStorage.setItem('cityPromptShown', 'true');
        }, 1500);
      }
    }).catch(() => {});

    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const handleClose = () => setShow(false);

  const toggleExam = (id) => {
    setSelectedExamIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Skip: the exam question is never asked again (All Exams stays in effect); city is asked next session.
  const handleSkip = async () => {
    if (needExams) {
      try { await API.updateProfile({ targetExamsPrompted: true }); } catch (e) { /* asked again next session */ }
    }
    setShow(false);
  };

  const handleSave = async () => {
    const hasLocation = state.trim() || city.trim();
    if (needCity && hasLocation) {
      if (!state.trim()) { toast.error('Please select your state'); return; }
      if (!city.trim()) { toast.error('Please select your city'); return; }
    }
    if (needCity && !hasLocation && !needExams) {
      toast.error('Please select your state');
      return;
    }
    setSaving(true);
    try {
      const payload = {};
      if (needCity && hasLocation) { payload.state = state.trim(); payload.city = city.trim(); }
      if (needExams) payload.targetExams = selectedExamIds;
      const res = await API.updateProfile(payload);
      if (res?.success) {
        const stored = getCurrentUser();
        if (stored) {
          localStorage.setItem('userInfo', JSON.stringify({
            ...stored,
            ...(payload.city ? { state: payload.state, city: payload.city } : {}),
            ...(needExams ? { targetExams: (res.user?.targetExams || []).map(String), primaryTargetExam: res.user?.primaryTargetExam } : {}),
          }));
        }
        if (needExams) notifyTargetExamsChanged();
        toast.success(needExams ? 'Preferences saved!' : 'City added! This helps rank you against students near you.');
        setShow(false);
      } else {
        toast.error(res?.message || 'Failed to save');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border-2 border-primary-500/20 p-5 sm:p-6"
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border-2 border-white dark:border-slate-800">
            {needCity ? <MapPin className="w-6 h-6 text-primary-600" /> : <Target className="w-6 h-6 text-primary-600" />}
          </div>

          <h2 className="text-lg font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white mb-1 text-center">
            {needCity && needExams ? 'Complete Your Profile' : needCity ? 'Add Your City' : 'Your Target Exams'}
          </h2>

          {needCity && (
            <>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-4 text-center">
                Show up on your city&apos;s leaderboard and compete with students near you.
              </p>
              <StateCitySelect
                state={state}
                city={city}
                onChange={({ state: newState, city: newCity }) => { setState(newState); setCity(newCity); }}
                stacked
              />
            </>
          )}

          {needExams && (
            <div className={needCity ? 'mt-5' : ''}>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-3 text-center">
                Which exams are you preparing for? We&apos;ll show only their content. Pick one or more, or keep All Exams.
              </p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                <button
                  type="button"
                  onClick={() => setSelectedExamIds([])}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedExamIds.length === 0 ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-500'}`}
                >
                  {selectedExamIds.length === 0 && <Check className="w-3 h-3" />}
                  All Exams
                </button>
                {exams.map((exam) => {
                  const active = selectedExamIds.includes(exam._id);
                  return (
                    <button
                      key={exam._id}
                      type="button"
                      onClick={() => toggleExam(exam._id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${active ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-500'}`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      {exam.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition shadow-sm disabled:opacity-70 border-b-2 border-primary-800 active:border-b-0 active:translate-y-1"
          >
            {saving ? 'Saving...' : needExams ? 'Save' : 'Save City'}
          </button>
          <button
            onClick={handleSkip}
            className="w-full mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            Skip
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CityPromptModal;
