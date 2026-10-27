'use client';
import Select from '../../../components/common/ui/Select';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Shield, Star, Users, BookOpen, Clock, Award, MessageCircle, Mail, AtSign, CalendarDays, Target, Lightbulb, Route, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/common/ui/Card';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
import AdminRoute from '../../../components/admin/Route';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const Panel = ({ icon: Icon, title, children, className = '' }) => (
  <section className={`relative overflow-hidden bg-background-surface rounded-2xl border border-border-primary ${className}`}>
    <section className="relative flex items-center gap-2.5 px-4 py-2.5 text-content-primary border-b border-border-primary dark:border-transparent bg-background-surface">
      <span className="relative w-8 h-8 shrink-0 flex items-center justify-center text-on-primary bg-primary-600" style={{ borderRadius: 10 }}><Icon className="w-4 h-4" /></span>
      <h2 className="relative text-xs font-bold uppercase tracking-[0.08em]">{title}</h2>
    </section>
    <div className="p-4">{children}</div>
  </section>
);

const AdminMentorDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.request(`/api/admin/mentors/${id}`);
      if (res?.success) setMentor(res.data);
      else { toast.error('Mentor not found'); router.push('/admin/mentors'); }
    } catch (e) { toast.error('Failed to load'); } finally { setLoading(false); }
  };
  useEffect(() => { if (id) fetchData(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (status, isVerified) => {
    try {
      const res = await API.request(`/api/admin/mentors/${id}`, { method: 'PUT', body: JSON.stringify({ status, isVerified }) });
      if (res?.success) { toast.success('Updated'); fetchData(); }
    } catch (e) { toast.error('Failed'); }
  };

  useAdminMobileHeader({ title: loading ? 'Loading...' : (mentor?.user?.name || 'Mentor') });

  if (loading) return (
    <AdminRoute>
      <div className="min-h-screen pb-6 xl:pb-12">
        <AdminTableSkeleton />
      </div>
    </AdminRoute>
  );
  if (!mentor) return null;

  return (
    <AdminRoute>
      <div className="min-h-screen pb-6 xl:pb-12">
        <Head><title>{mentor.user?.name || 'Mentor'} - Admin</title></Head>
        <div className="py-0 xl:py-3 space-y-2 xl:space-y-3">
          <Link href="/admin/mentors" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-background-surface border border-border-primary text-content-secondary hover:border-primary-400 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Mentors
          </Link>

          {/* Header */}
          <section className="relative isolate overflow-hidden border border-border-primary p-4 xl:p-5 bg-background-surface" style={{ borderRadius: 16 }}>

            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-14 h-14 xl:w-16 xl:h-16 shrink-0 flex items-center justify-center text-2xl font-bold text-on-primary bg-primary-600" style={{ borderRadius: 18 }}>
                  {(mentor.user?.name || 'M').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h1 className="flex items-center gap-2 text-xl xl:text-2xl font-bold font-outfit tracking-tight text-content-primary">
                    <span className="truncate">{mentor.user?.name || 'Unknown'}</span>
                    {mentor.isVerified && <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-on-primary text-[9px] font-bold uppercase tracking-[0.08em] bg-primary-600"><Shield className="w-3 h-3" /> Verified</span>}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {mentor.user?.email && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border-primary text-[10px] font-bold text-content-secondary dark:text-white/80"><Mail className="w-3 h-3" /> {mentor.user.email}</span>}
                    {mentor.user?.username && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border-primary text-[10px] font-bold text-content-secondary dark:text-white/80"><AtSign className="w-3 h-3" /> {mentor.user.username}</span>}
                    {mentor.user?.createdAt && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border-primary text-[10px] font-bold text-content-secondary dark:text-white/80"><CalendarDays className="w-3 h-3" /> Joined: {new Date(mentor.user.createdAt).toLocaleDateString('en-IN')}</span>}
                  </div>
                  {mentor.verifiedBy && (
                    <p className="mt-1.5 text-[10px] font-bold text-content-muted dark:text-white/60">Verified by {mentor.verifiedBy.name} on {new Date(mentor.verifiedAt).toLocaleDateString('en-IN')}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/70">Status:</label>
                <Select
                  value={mentor.status}
                  onChange={e => updateStatus(e.target.value, e.target.value === 'active' ? true : undefined)}
                  className="px-3 py-2 border border-border-primary rounded-lg text-xs font-bold bg-background-surface outline-none focus:border-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </Select>
                {mentor.status === 'active' && !mentor.isVerified && (
                  <button onClick={() => updateStatus('active', true)} className="px-3 py-2 text-on-primary rounded-lg text-[10px] font-bold uppercase tracking-[0.08em] hover:brightness-110 transition-all bg-primary-600"><Shield className="w-3 h-3 inline mr-1" />Verify</button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {[
                { icon: Star, value: mentor.rating?.toFixed(1) || '0.0', label: `${mentor.totalRatings || 0} Ratings` },
                { icon: Users, value: mentor.helpedStudents || 0, label: 'Students Helped' },
                { icon: Clock, value: mentor.preparationMonths || 0, label: 'Prep Months' },
                { icon: MessageCircle, value: mentor.amaThreads?.length || 0, label: 'AMA Threads' },
              ].map((st) => (
                <div key={st.label} className="relative overflow-hidden flex items-center gap-3 px-3 py-2.5 bg-white/80 hover:bg-background-surface dark:bg-white/10 dark:hover:bg-white/15 border border-border-primary transition-colors" style={{ borderRadius: 12 }}>
                  <st.icon className="absolute -right-2 -bottom-2 w-12 h-12 text-primary-600/10 dark:text-white/10" />
                  <span className="w-8 h-8 shrink-0 flex items-center justify-center text-on-primary bg-primary-600" style={{ borderRadius: 10 }}><st.icon className="w-4 h-4" /></span>
                  <div className="min-w-0">
                    <p className="text-xl font-bold font-outfit leading-none text-primary-600">{st.value}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75 leading-tight">{st.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 items-start">
            {/* Exams Cleared */}
            {mentor.examsCleared?.length > 0 && (
              <Panel icon={Award} title="Exams Cleared">
                <div className="space-y-2">
                  {mentor.examsCleared.map((e, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 flex-wrap px-3 py-2 rounded-xl dark:bg-white/5 border border-dashed border-primary-300 dark:border-white/15 text-xs">
                      <span className="font-bold text-content-primary">{e.examName} ({e.year})</span>
                      <span className="flex flex-wrap gap-1.5">
                        {e.rank ? <span className="px-2 py-0.5 rounded-full text-primary-600 text-[10px] font-bold">Rank {e.rank}</span> : null}
                        {e.score ? <span className="px-2 py-0.5 rounded-full bg-background-surface-secondary text-content-secondary text-[10px] font-bold">Score {e.score}</span> : null}
                        {e.attempt ? <span className="px-2 py-0.5 rounded-full bg-background-surface-secondary text-content-secondary text-[10px] font-bold">Attempt {e.attempt}</span> : null}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* Specialization */}
            {mentor.specialization?.length > 0 && (
              <Panel icon={Target} title="Specialization">
                <div className="flex flex-wrap gap-1.5">
                  {mentor.specialization.map((s, i) => (
                    <span key={i} className="px-3 py-1 text-primary-600 ring-1 ring-primary-200 dark:ring-white/15 rounded-full text-[11px] font-bold bg-background-surface">{s}</span>
                  ))}
                </div>
              </Panel>
            )}

            {/* Tips */}
            {mentor.tips?.length > 0 && (
              <Panel icon={Lightbulb} title="Tips">
                <ul className="space-y-1.5">
                  {mentor.tips.map((t, i) => (
                    <li key={i} className="text-xs text-content-secondary flex gap-2.5 items-start">
                      <span className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center rounded-md text-primary-600 text-[10px] font-bold">{i + 1}</span>
                      <span className="leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {/* Books Recommended */}
            {mentor.booksRecommended?.length > 0 && (
              <Panel icon={BookOpen} title="Books Recommended">
                <ul className="space-y-1.5">
                  {mentor.booksRecommended.map((b, i) => (
                    <li key={i} className="text-xs text-content-secondary flex gap-2.5 items-start">
                      <span className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center rounded-md text-primary-600"><BookOpen className="w-3 h-3" /></span>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>

          {/* Strategy */}
          <Panel icon={FileText} title="Preparation Strategy">
            <p className="text-xs xl:text-sm text-content-secondary whitespace-pre-line leading-relaxed">{mentor.strategy}</p>
          </Panel>

          {/* Daily Routine */}
          {mentor.dailyRoutine && (
            <Panel icon={Route} title="Daily Routine">
              <p className="text-xs xl:text-sm text-content-secondary whitespace-pre-line leading-relaxed">{mentor.dailyRoutine}</p>
            </Panel>
          )}

          {/* AMA Threads */}
          {mentor.amaThreads?.length > 0 && (
            <Panel icon={MessageCircle} title="AMA Threads">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                {mentor.amaThreads.map((t, i) => (
                  <div key={i} className="p-3 rounded-xl bg-background-surface-secondary border border-border-primary space-y-1.5">
                    <p className="text-xs font-bold text-content-primary">Q: {t.question}</p>
                    <p className="text-[9px] font-bold text-content-muted">Asked by {t.askedBy?.name || 'Anonymous'} · {t.upvotes || 0} upvotes</p>
                    {t.answer ? (
                      <p className="text-xs text-content-secondary pl-2.5 border-l-2 border-primary-500">A: {t.answer}</p>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold">Not answered yet</span>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminMentorDetail;
