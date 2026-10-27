'use client';

import Select from '../../common/ui/Select';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, User, GraduationCap, ShieldCheck, Search, Check, MapPin, Link2 } from 'lucide-react';

import API from '../../../lib/api';
import Sidebar from '../Sidebar';
import StateCitySelect from '../../common/StateCitySelect';
import { QUALIFICATIONS, GENDERS, HEARD_FROM } from '../../../lib/constants/profileOptions';
import { AdminFormSkeleton } from '../Skeletons';
import { useSSR } from '../../../hooks/useSSR';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const IN = 'w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg text-sm font-semibold text-content-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 disabled:opacity-60';
const LB = 'block text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-1';
const TILE = 'w-8 h-8 shrink-0 flex items-center justify-center text-on-primary bg-primary-600';

const STATUSES = ['active', 'inactive', 'suspended', 'banned'];
const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
  { key: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/username' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@username' },
];

// Date of birth bounds: aged 10 to 100 (same as the student's own form)
const dobBounds = () => {
  const d = new Date();
  const iso = (y) => `${d.getFullYear() - y}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { min: iso(100), max: iso(10) };
};

const toDateInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 10);
};

const Section = ({ icon: Icon, title, children, className = '' }) => (
  <section className={`relative bg-background-surface rounded-2xl border border-border-primary p-4 ${className}`}>
    <h2 className="flex items-center gap-2.5 mb-3 text-xs font-bold uppercase tracking-[0.08em] text-content-primary">
      <span className={TILE} style={{ borderRadius: 10 }}><Icon className="w-4 h-4" /></span>
      {title}
    </h2>
    {children}
  </section>
);

const Toggle = ({ checked, onChange, label, hint }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${checked ? 'border-primary-400' : 'border-border-primary bg-background-surface'}`}
  >
    <span>
      <span className="block text-xs font-bold uppercase tracking-wide text-content-primary">{label}</span>
      {hint && <span className="block text-[10px] font-bold text-content-muted">{hint}</span>}
    </span>
    <span className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${checked ? 'bg-primary-600' : 'bg-border-primary dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background-surface transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </span>
  </button>
);

const StudentEditPage = ({ studentId }) => {
  const { isMounted, router } = useSSR();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState(null);
  const [exams, setExams] = useState([]);
  const [examSearch, setExamSearch] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const dob = useMemo(dobBounds, []);

  useAdminMobileHeader({ title: 'Edit Student' });

  useEffect(() => {
    if (!studentId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [res, ex] = await Promise.all([API.getStudent(studentId), API.getAllExams({ limit: 1000 }).catch(() => null)]);
        if (!alive) return;
        if (!res?.success) { setError(res?.message || 'Student not found'); return; }
        const s = res.data;
        setOriginal(s);
        setForm({
          name: s.name || '',
          email: s.email || '',
          phone: s.phone || '',
          username: s.username || '',
          gender: s.gender || '',
          dateOfBirth: toDateInput(s.dateOfBirth),
          qualification: s.qualification || '',
          city: s.city || '',
          state: s.state || '',
          heardFrom: s.heardFrom || '',
          bio: s.bio || '',
          isPublicProfile: !!s.isPublicProfile,
          targetExams: (s.targetExams || []).map((e) => String(e._id || e)),
          socialLinks: { instagram: s.socialLinks?.instagram || '', facebook: s.socialLinks?.facebook || '', x: s.socialLinks?.x || '', youtube: s.socialLinks?.youtube || '' },
          status: s.status || 'active',
          isBlocked: !!s.isBlocked,
        });
        if (ex?.success) setExams(ex.data || []);
      } catch (e) {
        if (alive) setError(e?.message || 'Failed to load student');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [studentId]);

  const dirty = useMemo(() => {
    if (!original || !form) return false;
    const base = {
      name: original.name || '', email: original.email || '', phone: original.phone || '', username: original.username || '',
      gender: original.gender || '', dateOfBirth: toDateInput(original.dateOfBirth), qualification: original.qualification || '',
      city: original.city || '', state: original.state || '', heardFrom: original.heardFrom || '', bio: original.bio || '',
      isPublicProfile: !!original.isPublicProfile, targetExams: (original.targetExams || []).map((e) => String(e._id || e)).sort().join(','),
      socialLinks: { instagram: original.socialLinks?.instagram || '', facebook: original.socialLinks?.facebook || '', x: original.socialLinks?.x || '', youtube: original.socialLinks?.youtube || '' },
      status: original.status || 'active', isBlocked: !!original.isBlocked,
    };
    const cur = { ...form, targetExams: [...form.targetExams].sort().join(',') };
    return JSON.stringify(base) !== JSON.stringify(cur);
  }, [original, form]);

  const filteredExams = useMemo(() => {
    const q = examSearch.trim().toLowerCase();
    return exams.filter((e) => !q || `${e.code || ''} ${e.name || ''}`.toLowerCase().includes(q));
  }, [exams, examSearch]);

  const toggleExam = (id) => set('targetExams', form.targetExams.includes(id) ? form.targetExams.filter((x) => x !== id) : [...form.targetExams, id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    try {
      setSaving(true);
      const res = await API.updateStudent(studentId, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        username: form.username,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || null,
        qualification: form.qualification,
        city: form.city,
        state: form.state,
        heardFrom: form.heardFrom,
        bio: form.bio,
        isPublicProfile: form.isPublicProfile,
        targetExams: form.targetExams,
        socialLinks: form.socialLinks,
        status: form.status,
        isBlocked: form.isBlocked,
      });
      if (res?.success) {
        toast.success('Student updated');
        setOriginal({ ...original, ...res.student, targetExams: form.targetExams });
      } else {
        toast.error(res?.message || res?.error || 'Failed to update');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto flex-1 min-h-0 flex flex-col">
        {loading ? (
          <div className="p-4"><AdminFormSkeleton fields={8} /></div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-bold text-red-600">{error}</p>
            <Link href="/admin/students" className="px-4 py-2 rounded-lg bg-background-surface-secondary text-sm font-bold">Back to students</Link>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col">
            {/* Top bar */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 pb-3">
              <Link href="/admin/students" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-background-surface border border-border-primary hover:border-primary-400 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Students
              </Link>
              <div className="min-w-0 text-center flex-1">
                <div className="text-sm font-bold truncate">{original?.name}</div>
                <div className="text-[10px] font-bold text-content-muted truncate">{original?.email}</div>
              </div>
              <div className="inline-flex p-1 rounded-full bg-background-surface border border-border-primary">
                <Link href={`/admin/user-details/${original?.username || studentId}`} className="px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:hover:bg-white/10">Details</Link>
                <span className="px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] text-on-primary bg-primary-600">Edit</span>
              </div>
            </div>

            {/* Scrollable sections */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-3 space-y-3">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 items-start">
                <Section icon={User} title="Account">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className={LB}>Full name *</label>
                      <input className={IN} value={form.name} onChange={(e) => set('name', e.target.value)} required />
                    </div>
                    <div>
                      <label className={LB}>Email *</label>
                      <input type="email" className={IN} value={form.email} onChange={(e) => set('email', e.target.value)} required />
                    </div>
                    <div>
                      <label className={LB}>Phone</label>
                      <input className={IN} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LB}>Username</label>
                      <input className={IN} value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="3-20 letters, numbers or _" />
                    </div>
                  </div>
                </Section>

                <Section icon={ShieldCheck} title="Status and access">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={LB}>Status</label>
                      <Select className={IN} value={form.status} onChange={(e) => set('status', e.target.value)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </Select>
                    </div>
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Toggle checked={form.isBlocked} onChange={(v) => set('isBlocked', v)} label="Blocked" hint="Blocked students cannot sign in" />
                      <Toggle checked={form.isPublicProfile} onChange={(v) => set('isPublicProfile', v)} label="Public profile" hint="Visible at /@username" />
                    </div>
                  </div>
                </Section>

                <Section icon={MapPin} title="Profile">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={LB}>Gender</label>
                      <Select className={IN} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                        <option value="">Select gender</option>
                        {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </Select>
                    </div>
                    <div>
                      <label className={LB}>Date of birth</label>
                      <input type="date" className={IN} min={dob.min} max={dob.max} value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LB}>State and city</label>
                      <StateCitySelect compact state={form.state} city={form.city} onChange={({ state, city }) => setForm((f) => ({ ...f, state, city }))} />
                    </div>
                    <div>
                      <label className={LB}>Qualification</label>
                      <Select className={IN} value={form.qualification} onChange={(e) => set('qualification', e.target.value)}>
                        <option value="">Select qualification</option>
                        {QUALIFICATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Select>
                    </div>
                    <div>
                      <label className={LB}>How did they hear about us?</label>
                      <Select className={IN} value={form.heardFrom} onChange={(e) => set('heardFrom', e.target.value)}>
                        <option value="">Select an option</option>
                        {HEARD_FROM.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LB}>Bio <span className="normal-case tracking-normal font-bold text-content-muted">({form.bio.length}/200)</span></label>
                      <textarea rows={3} maxLength={200} className={`${IN} resize-y`} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
                    </div>
                  </div>
                </Section>

                <Section icon={Link2} title="Social links">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SOCIAL_FIELDS.map((soc) => (
                      <div key={soc.key}>
                        <label className={LB}>{soc.label}</label>
                        <input className={IN} placeholder={soc.placeholder} value={form.socialLinks[soc.key]} onChange={(e) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [soc.key]: e.target.value } }))} />
                      </div>
                    ))}
                  </div>
                </Section>

                <Section icon={GraduationCap} title={`Target exams (${form.targetExams.length})`}>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
                    <input className={`${IN} pl-9`} placeholder="Search exams..." value={examSearch} onChange={(e) => setExamSearch(e.target.value)} />
                  </div>
                  {form.targetExams.length === 0 && <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted">No exam selected - the student sees all exams</p>}
                  <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                    {filteredExams.map((ex) => {
                      const on = form.targetExams.includes(String(ex._id));
                      return (
                        <button
                          key={ex._id}
                          type="button"
                          onClick={() => toggleExam(String(ex._id))}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ${on ? 'text-on-primary border-transparent bg-primary-600' : 'bg-background-surface text-content-secondary border-border-primary hover:border-primary-400'}`}
                        >
                          {on && <Check className="w-3 h-3" />}
                          {ex.code || ex.name}
                        </button>
                      );
                    })}
                  </div>
                </Section>
              </div>
            </div>

            {/* Fixed footer */}
            <div className="shrink-0 -mx-1 px-4 py-2.5 border-t border-border-primary bg-background-surface flex items-center justify-end gap-3">
              {dirty && <span className="mr-auto text-[10px] font-bold uppercase tracking-[0.08em] text-amber-600 dark:text-amber-400">Unsaved changes</span>}
              <button type="button" onClick={() => router.push('/admin/students')} className="px-6 py-2.5 rounded-lg bg-background-surface-secondary text-content-secondary text-[10px] font-bold uppercase tracking-[0.08em] hover:bg-background-surface-secondary transition-all">Cancel</button>
              <button type="submit" disabled={saving || !dirty} className="px-6 py-2.5 rounded-lg text-on-primary text-[10px] font-bold uppercase tracking-[0.08em] flex items-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-primary-600">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentEditPage;
