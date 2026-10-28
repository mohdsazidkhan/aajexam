'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { isMobile } from 'react-device-detect';
import Link from 'next/link';
import {
  ArrowLeft, User as UserIcon, Mail, Phone, MapPin, Calendar, Crown, ShieldCheck, Flame,
  GraduationCap, ListChecks, Trophy, Film, CreditCard, Users, Settings, MessageSquare, ExternalLink,
  Table as TableIcon, List as ListIcon, LayoutGrid
} from 'lucide-react';
import Sidebar from '../Sidebar';
import { AdminDetailSkeleton } from '../Skeletons';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const TABS = [
  { id: 'overview', label: 'Overview', Icon: UserIcon },
  { id: 'settings', label: 'Profile & settings', Icon: Settings },
  { id: 'exams', label: 'Exams', Icon: GraduationCap },
  { id: 'quizzes', label: 'Quizzes', Icon: ListChecks },
  { id: 'daily', label: 'Daily challenges', Icon: Trophy },
  { id: 'reels', label: 'Reels', Icon: Film },
  { id: 'billing', label: 'Plan & payments', Icon: CreditCard },
  { id: 'activity', label: 'Streak & community', Icon: Flame },
];

const fmt = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return '—';
  return `${x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}, ${x.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}`;
};
const fmtDay = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '—');
const dur = (sec) => {
  const s = Math.round(sec || 0);
  if (!s) return '—';
  const m = Math.floor(s / 60);
  return m ? `${m}m ${s % 60}s` : `${s}s`;
};
const num = (v, d = 0) => (v == null || Number.isNaN(Number(v)) ? '—' : Number(v).toFixed(d).replace(/\.0+$/, ''));
const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const Card = ({ title, children, right, fill, className = '' }) => (
  <div className={`bg-background-surface rounded-xl border border-border-primary overflow-hidden  ${className}`}>
    {title ? (
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-primary shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted">{title}</div>
        {right}
      </div>
    ) : null}
    <div className="p-3">{children}</div>
  </div>
);

const Stat = ({ label, value, sub }) => (
  <div className="bg-background-surface rounded-lg border border-border-primary px-2.5 py-1.5 min-w-0">
    <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted truncate">{label}</div>
    <div className="flex items-baseline gap-1.5 min-w-0">
      <span className="text-base font-bold tabular-nums leading-tight">{value}</span>
      {sub ? <span className="text-[10px] text-content-muted truncate">{sub}</span> : null}
    </div>
  </div>
);

const Field = ({ label, value }) => (
  <div className="flex justify-between gap-3 py-1 text-xs border-b border-border-primary dark:border-slate-700/40 last:border-0">
    <span className="text-content-muted font-bold">{label}</span>
    <span className="font-bold text-right break-all sm:break-words max-w-[65%]">{value === '' || value == null ? '—' : String(value)}</span>
  </div>
);

const Pill = ({ children, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-500/10 text-content-muted border-slate-500/20',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    sky: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  };
  return <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.08em] border ${tones[tone]}`}>{children}</span>;
};

const statusTone = (s) => (['Completed', 'active', 'paid', 'completed', 'mastered', 'success'].includes(s) ? 'green' : ['InProgress', 'pending', 'created'].includes(s) ? 'amber' : ['Abandoned', 'failed', 'cancelled', 'expired', 'refunded'].includes(s) ? 'rose' : 'slate');

// Generic compact table; `cols` = [{ h, r: (row) => node, right }]
const ViewContext = createContext('table');

// Value that renders as nothing (used to skip empty fields in the grid / list views)
const isBlank = (v) => v === '' || v == null || v === false;

const SNo = ({ n }) => (
  <span className="w-6 h-6 rounded-full bg-primary-600 text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0">{n}</span>
);

// Generic data view: Table / List / Grid, chosen once for the whole page. cols = [{ h, r: (row) => node, right }]
// The first column is the "title" of a row in the grid / list views.
const Table = ({ rows, cols, empty = 'Nothing yet' }) => {
  const view = useContext(ViewContext);
  if (!rows || !rows.length) return <div className="text-sm text-content-muted py-2">{empty}</div>;

  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {rows.map((row, i) => (
          <div key={row._id || i} className="rounded-lg border border-border-primary bg-slate-50/50 p-3">
            <div className="flex items-start gap-2">
              <SNo n={i + 1} />
              <div className="min-w-0 text-sm font-bold break-words">{cols[0].r(row, i)}</div>
            </div>
            <div className="mt-2 space-y-1">
              {cols.slice(1).map((c) => {
                const v = c.r(row, i);
                return isBlank(v) ? null : (
                  <div key={c.h} className="flex justify-between gap-3 text-xs">
                    <span className="text-content-muted font-bold shrink-0">{c.h}</span>
                    <span className="text-right break-words min-w-0">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={row._id || i} className="rounded-lg border border-border-primary bg-slate-50/50 px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-2 min-w-0 sm:min-w-[220px] flex-1 basis-full sm:basis-auto">
              <SNo n={i + 1} />
              <div className="min-w-0 text-sm font-bold break-words">{cols[0].r(row, i)}</div>
            </div>
            {cols.slice(1).map((c) => {
              const v = c.r(row, i);
              return isBlank(v) ? null : (
                <div key={c.h} className="text-xs">
                  <span className="text-content-muted font-bold">{c.h}: </span>
                  <span className="font-semibold">{v}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-background-surface-secondary z-10 border-b border-border-primary">
          <tr><th className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted text-left whitespace-nowrap w-12">S.No</th>{cols.map((c) => <th key={c.h} className={`px-2 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted whitespace-nowrap ${c.right ? 'text-right' : 'text-left'}`}>{c.h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border-primary">
          {rows.map((row, i) => (
            <tr key={row._id || i}>
              <td className="px-2 py-1.5 align-middle text-content-muted font-bold tabular-nums">{i + 1}</td>
              {cols.map((c) => <td key={c.h} className={`px-2 py-1.5 align-middle ${c.right ? 'text-right tabular-nums whitespace-nowrap' : ''}`}>{c.r(row, i)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const VIEWS = [
  { id: 'table', label: 'Table', Icon: TableIcon },
  { id: 'list', label: 'List', Icon: ListIcon },
  { id: 'grid', label: 'Grid', Icon: LayoutGrid },
];

const ViewSwitch = ({ view, setView, className = '' }) => (
  <div className={`flex shrink-0 gap-1 bg-background-surface-secondary p-1 rounded-xl ${className}`}>
    {VIEWS.map(({ id: vid, label, Icon }) => (
      <button key={vid} onClick={() => setView(vid)} title={`${label} view`} aria-label={`${label} view`} className={`border border-primary-600 p-1.5 rounded-lg transition ${view === vid ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:bg-background-surface dark:hover:bg-white/10'}`}>
        <Icon className="w-4 h-4" />
      </button>
    ))}
  </div>
);


export default function UserFullDetail() {
  const { isMounted, isRouterReady, router } = useSSR();
  const id = router?.query?.id;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [view, setView] = useState(isMobile ? 'grid' : 'table');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await API.getAdminUserFullDetail(id);
      if (res?.success) setData(res.data);
      else setError(res?.message || 'Failed to load user');
    } catch (e) {
      setError(e?.message || 'Failed to load user');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { if (isRouterReady) load(); }, [isRouterReady, load]);

  // Opened with a user id: show the username in the address bar instead (no reload, the data is already here).
  useEffect(() => {
    const username = data?.profile?.username;
    if (username && id && /^[a-f0-9]{24}$/i.test(String(id))) {
      router.replace(`/admin/user-details/${encodeURIComponent(username)}`, undefined, { shallow: true });
    }
  }, [data, id, router]);

  const p = data?.profile;
  useAdminMobileHeader({ title: p?.name || 'User', count: null, filters: null });

  if (!isMounted) return null;

  const shell = (children) => (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto flex-1 min-h-0 overflow-y-auto xl:overflow-hidden flex flex-col gap-3 max-xl:[&>*]:shrink-0">{children}</div>
    </div>
  );

  if (loading && !data) return shell(<AdminDetailSkeleton />);
  if (error || !p) {
    return shell(
      <div className="text-center py-20">
        <div className="p-4 rounded-xl bg-rose-500/10 text-rose-600 text-sm font-bold inline-block">{error || 'User not found'}</div>
        <div className="mt-4"><Link href="/admin/students" className="text-primary-600 font-bold text-sm">← Back to students</Link></div>
      </div>
    );
  }

  const s = data.stats;
  const examDone = s.exams?.Completed?.count || 0;
  const examAll = Object.values(s.exams || {}).reduce((t, x) => t + x.count, 0);
  const quizDone = s.quizzes?.Completed?.count || 0;
  const quizAll = Object.values(s.quizzes || {}).reduce((t, x) => t + x.count, 0);

  return shell(
    <ViewContext.Provider value={view}>
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-content-muted hover:text-primary-600">
          <ArrowLeft className="w-4 h-4" /> All students
        </Link>
        {p._id ? (
          <div className="inline-flex p-1 rounded-full bg-background-surface border border-border-primary">
            <span className="px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] text-on-primary bg-primary-600">Details</span>
            <Link href={`/admin/students/${p._id}`} className="px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] text-content-secondary">Edit</Link>
          </div>
        ) : null}
        {p.username ? (
          <Link href={`/@${p.username}`} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600">
            Public profile <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ) : null}
      </div>

      {/* Header */}
      <Card className="shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3">
          <div className="flex items-start justify-between gap-3">
            {p.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.profilePicture} alt="" className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 text-on-primary rounded-2xl flex items-center justify-center font-bold text-2xl bg-primary-600">{p.name?.[0] || 'U'}</div>
            )}
            {tab !== 'settings' && <ViewSwitch view={view} setView={setView} className="sm:hidden" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold leading-tight break-words">{p.name || 'Anonymous'}</h1>
              <Pill tone={p.subscriptionStatus === 'PRO' ? 'amber' : 'slate'}>{p.subscriptionStatus === 'PRO' ? <><Crown className="inline w-3 h-3 -mt-0.5" /> PRO</> : 'FREE'}</Pill>
              <Pill tone={statusTone(p.status === 'active' ? 'active' : 'failed')}>{p.status}</Pill>
              {p.role === 'admin' ? <Pill tone="sky"><ShieldCheck className="inline w-3 h-3 -mt-0.5" /> Admin</Pill> : null}
              {p.hasGoogle ? <Pill tone="sky">Google</Pill> : null}
            </div>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap gap-x-3 gap-y-1 text-xs text-content-muted font-bold break-all sm:break-normal">
              <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{p.email}</span>
              {p.phone ? <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{p.phone}</span> : null}
              {p.city || p.state ? <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{[p.city, p.state].filter(Boolean).join(', ')}</span> : null}
              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {fmt(p.createdAt)}</span>
              <span>Last login {fmt(p.lastLoginDate)}</span>
              {p.subscriptionStatus === 'PRO' ? <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"><Crown className="w-3.5 h-3.5" />PRO expires {p.subscriptionExpiry ? fmt(p.subscriptionExpiry) : 'never'}</span> : null}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs + view switch */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex gap-1 overflow-x-auto min-w-0 flex-1 bg-background-surface-secondary p-1 rounded-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map(({ id: tid, label, Icon }) => (
            <button key={tid} onClick={() => setTab(tid)} className={`border border-primary-600 shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] transition ${tab === tid ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:bg-background-surface dark:hover:bg-white/10'}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
        {tab !== 'settings' && <ViewSwitch view={view} setView={setView} className="hidden sm:flex" />}
      </div>

      <div className="xl:flex-1 xl:min-h-0 xl:overflow-auto flex flex-col gap-3 [&>*]:shrink-0 pb-4 xl:pb-0">
      {tab === 'overview' && (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-1.5 shrink-0">
        <Stat label="Exam attempts" value={examAll} sub={`${examDone} completed`} />
        <Stat label="Quiz attempts" value={quizAll} sub={`${quizDone} completed`} />
        <Stat label="Daily challenges" value={s.dailyChallenges} />
        <Stat label="Reels viewed" value={s.reels.viewed} sub={`${s.reels.answered} answered · ${s.reels.correct} correct`} />
        <Stat label="Current streak" value={data.streak?.currentStreak ?? 0} sub={`best ${data.streak?.longestStreak ?? 0} · ${data.streak?.totalActiveDays ?? 0} active days`} />
        <Stat label="Paid" value={inr(s.paid.total)} sub={`${s.paid.orders} orders`} />
        <Stat label="Referral Rewards" value={inr(p.walletBalance)} />
        <Stat label="Referrals" value={s.referrals} sub={`code ${p.referralCode || '—'}`} />
        <Stat label="Community" value={s.communityQuestions + s.communityAnswers} sub={`${s.communityQuestions} Q · ${s.communityAnswers} A`} />
        <Stat label="Followers" value={p.followersCount || 0} sub={`${p.followingCount || 0} following`} />
        <Stat label="Profile views" value={p.profileViews || 0} />
        <Stat label="Profile complete" value={p.profileCompleted ? 'Yes' : 'No'} />
      </div>
      )}

      {tab === 'reels' && (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-1.5 shrink-0">
        <Stat label="Viewed" value={s.reels.viewed} />
        <Stat label="Liked" value={s.reels.liked} />
        <Stat label="Bookmarked" value={s.reels.bookmarked} />
        <Stat label="Shared" value={s.reels.shared} />
        <Stat label="Answered" value={s.reels.answered} sub={`${s.reels.correct} correct`} />
        <Stat label="Time on reels" value={dur(s.reels.seconds)} />
      </div>
      )}

      {tab === 'overview' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <Card fill title="Recent exam attempts"><ExamTable fill rows={(data.examAttempts || []).slice(0, 3)} /></Card>
            <Card fill title="Recent quiz attempts"><QuizTable fill rows={(data.quizAttempts || []).slice(0, 3)} /></Card>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="grid xl:grid-cols-3 gap-3">
          <Card title="Personal info">
            <Field label="Name" value={p.name} />
            <Field label="Username" value={p.username && `@${p.username}`} />
            <Field label="Email" value={p.email} />
            <Field label="Phone" value={p.phone} />
            <Field label="Gender" value={p.gender} />
            <Field label="Date of birth" value={p.dateOfBirth ? fmtDay(p.dateOfBirth) : ''} />
            <Field label="Qualification" value={p.qualification} />
            <Field label="City / State" value={[p.city, p.state].filter(Boolean).join(', ')} />
            <Field label="Heard about us from" value={p.heardFrom} />
            <Field label="Bio" value={p.bio} />
            <Field label="Public profile" value={p.isPublicProfile ? 'Yes' : 'No'} />
          </Card>
          <Card title="Exam goals">
            <Field label="Primary target exam" value={p.primaryTargetExam} />
            <Field label="Target exams" value={(p.targetExams || []).map((e) => e.name).join(', ')} />
            <Field label="Asked to choose exams" value={p.targetExamsPrompted ? 'Yes' : 'No'} />
            <Field label="Overall readiness" value={p.performanceMetrics?.examStats?.overallReadiness != null ? `${num(p.performanceMetrics.examStats.overallReadiness)}%` : ''} />
            <Field label="Mock tests attempted" value={p.performanceMetrics?.examStats?.mockTestsAttempted} />
            <Field label="Average mock score" value={num(p.performanceMetrics?.examStats?.averageMockScore, 1)} />
          </Card>
          <Card title="App settings (preferences)">
            <Field label="Language" value={p.preferences?.language} />
            <Field label="Theme" value={p.preferences?.themeId} />
            <Field label="Dark mode" value={p.preferences?.isDark == null ? '' : p.preferences.isDark ? 'Yes' : 'No'} />
            <Field label="Follow system theme" value={p.preferences?.followSystem == null ? '' : p.preferences.followSystem ? 'Yes' : 'No'} />
            <Field label="Font" value={p.preferences?.fontFamily} />
            <Field label="Text size" value={p.preferences?.textSizeId} />
            <Field label="Lite mode" value={p.preferences?.liteMode == null ? '' : p.preferences.liteMode ? 'On' : 'Off'} />
            <Field label="Reduce motion" value={p.preferences?.reduceMotion == null ? '' : p.preferences.reduceMotion ? 'On' : 'Off'} />
            <Field label="Eye comfort" value={p.preferences?.eyeComfort == null ? '' : p.preferences.eyeComfort ? 'On' : 'Off'} />
            <Field label="Pure black" value={p.preferences?.pureBlack == null ? '' : p.preferences.pureBlack ? 'On' : 'Off'} />
            <Field label="Colour-blind mode" value={p.preferences?.colorBlind == null ? '' : p.preferences.colorBlind ? 'On' : 'Off'} />
            <Field label="Settings last changed" value={p.preferences?.updatedAt ? fmt(p.preferences.updatedAt) : ''} />
          </Card>
          <Card title="Account">
            <Field label="Status" value={p.status} />
            <Field label="Status reason" value={p.statusReason} />
            <Field label="Status changed" value={fmt(p.statusChangedAt)} />
            <Field label="Role" value={p.role} />
            <Field label="Signed up with" value={p.hasGoogle ? 'Google' : 'Email / phone + password'} />
            <Field label="Joined" value={fmt(p.createdAt)} />
            <Field label="Last login" value={fmt(p.lastLoginDate)} />
            <Field label="Subscription" value={p.subscriptionStatus} />
            <Field label="Subscription expiry" value={p.subscriptionExpiry ? fmt(p.subscriptionExpiry) : ''} />
          </Card>
          <Card title="Social links">
            {['instagram', 'facebook', 'x', 'youtube'].map((k) => (
              <Field key={k} label={k} value={p.socialLinks?.[k]} />
            ))}
          </Card>
          <Card title="Referral">
            <Field label="Referral code" value={p.referralCode} />
            <Field label="Referred by (code)" value={p.referredBy} />
            <Field label="People referred" value={s.referrals} />
            <Field label="Referral Rewards" value={inr(p.walletBalance)} />
          </Card>
        </div>
      )}

      {tab === 'exams' && (
        <Card fill title={`Exam attempts (latest ${Math.min(data.limit, examAll)} of ${examAll})`}>
          <ExamTable fill rows={data.examAttempts} />
        </Card>
      )}

      {tab === 'quizzes' && (
        <Card fill title={`Quiz attempts (latest ${Math.min(data.limit, quizAll)} of ${quizAll})`}>
          <QuizTable fill rows={data.quizAttempts} />
        </Card>
      )}

      {tab === 'daily' && (
        <Card fill title={`Daily challenges (latest ${Math.min(data.limit, s.dailyChallenges)} of ${s.dailyChallenges})`}>
          <Table
            fill
            rows={data.dailyAttempts}
            empty="No daily challenge attempts"
            cols={[
              { h: 'Challenge', r: (r) => <span className="font-bold">{r.challenge?.title || 'Deleted challenge'}</span> },
              { h: 'Challenge date', r: (r) => fmtDay(r.challenge?.date) },
              { h: 'Score', right: true, r: (r) => num(r.score) },
              { h: 'Correct', right: true, r: (r) => r.correctCount },
              { h: 'Wrong', right: true, r: (r) => r.wrongCount },
              { h: 'Skipped', right: true, r: (r) => r.skippedCount },
              { h: 'Accuracy', right: true, r: (r) => `${num(r.accuracy)}%` },
              { h: 'Time', right: true, r: (r) => dur(r.totalTime) },
              { h: 'Submitted', right: true, r: (r) => fmt(r.submittedAt) },
            ]}
          />
        </Card>
      )}

      {tab === 'reels' && (
        <div className="flex flex-col gap-3">
          <Card fill title={`Reel activity (latest ${Math.min(data.limit, s.reels.viewed)} of ${s.reels.viewed})`}>
            <Table
              fill
              rows={data.reelInteractions}
              empty="No reel activity"
              cols={[
                { h: 'Reel', r: (r) => <span className="font-bold">{r.reelId?.title || r.reelId?.type || 'Deleted reel'}</span> },
                { h: 'Type', r: (r) => r.reelId?.type || '—' },
                { h: 'Subject', r: (r) => r.reelId?.subject || '—' },
                { h: 'Liked', r: (r) => (r.liked ? '♥' : '') },
                { h: 'Saved', r: (r) => (r.bookmarked ? '★' : '') },
                { h: 'Shared', r: (r) => (r.shared ? '✓' : '') },
                { h: 'Answer', r: (r) => (r.answered ? <Pill tone={r.isCorrect ? 'green' : 'rose'}>{r.isCorrect ? 'Correct' : 'Wrong'}</Pill> : '') },
                { h: 'Time', right: true, r: (r) => dur(r.timeSpentSeconds) },
                { h: 'Viewed', right: true, r: (r) => fmt(r.viewedAt) },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'billing' && (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
          <Card title="Subscriptions" className="2xl:col-span-2">
            <Table
              rows={data.subscriptions}
              empty="No subscriptions"
              cols={[
                { h: 'Plan', r: (r) => <span className="font-bold">{r.plan}</span> },
                { h: 'Status', r: (r) => <Pill tone={statusTone(r.status)}>{r.status}</Pill> },
                { h: 'Start', r: (r) => fmtDay(r.startDate) },
                { h: 'End', r: (r) => fmtDay(r.endDate) },
                { h: 'Amount', right: true, r: (r) => inr(r.amount) },
                { h: 'Coupon', r: (r) => r.couponCode || '—' },
              ]}
            />
          </Card>
          <Card title={`Payment orders (latest ${Math.min(data.limit, data.payments.length)})`} className="2xl:col-span-2">
            <Table
              rows={data.payments}
              empty="No payments"
              cols={[
                { h: 'Date', r: (r) => <span className="whitespace-nowrap">{fmt(r.date)}</span> },
                {
                  h: 'Plan', r: (r) => (
                    <div className="min-w-[160px]">
                      <div className="font-bold">{r.description}</div>
                      {r.subscription ? <div className="text-[10px] uppercase text-content-muted">{r.subscription.plan} &bull; {r.subscription.status}</div> : null}
                      <div className="font-mono text-[10px] text-content-muted break-all">{r.orderId}</div>
                    </div>
                  ),
                },
                {
                  h: 'Amount', right: true, r: (r) => (
                    <div>
                      <div className="font-bold">{inr(r.amount)} <span className="text-[9px] font-bold text-content-muted">{r.currency}</span></div>
                      {r.discountAmount ? <div className="text-[10px] text-content-muted">{inr(r.originalAmount)} − {inr(r.discountAmount)}{r.couponCode ? ` (${r.couponCode})` : ''}</div> : null}
                      {r.refundAmount ? <div className="text-[10px] text-rose-600">Refunded {inr(r.refundAmount)}</div> : null}
                    </div>
                  ),
                },
                { h: 'Status', r: (r) => <Pill tone={statusTone(r.status)}>{r.status}</Pill> },
                { h: 'Payment mode', r: (r) => r.paymentMode || 'N/A' },
                { h: 'UPI ID', r: (r) => r.upiId || 'N/A' },
                { h: 'UPI app / channel', r: (r) => r.upiChannel || r.bankCode || 'N/A' },
                { h: 'Product info', r: (r) => r.productInfo || 'N/A' },
                { h: 'Bank ref. no.', r: (r) => r.bankRefNum || 'N/A' },
              ]}
            />
          </Card>
          <Card title="Referral Rewards transactions">
            <Table
              rows={data.walletTxns}
              empty="No Referral Rewards transactions"
              cols={[
                { h: 'Type', r: (r) => <Pill tone={r.type === 'credit' ? 'green' : 'rose'}>{r.type}</Pill> },
                { h: 'Description', r: (r) => r.description },
                { h: 'Amount', right: true, r: (r) => inr(r.amount) },
                { h: 'Balance', right: true, r: (r) => inr(r.balance) },
                { h: 'Date', right: true, r: (r) => fmt(r.processedAt || r.createdAt) },
              ]}
            />
          </Card>
          <Card title={`Referred users (${s.referrals})`}>
            <Table
              rows={data.referrals}
              empty="No referrals"
              cols={[
                { h: 'Name', r: (r) => <span className="font-bold">{r.name || '—'}</span> },
                { h: 'Email', r: (r) => r.email },
                { h: 'Plan', r: (r) => r.subscriptionStatus },
                { h: 'Joined', right: true, r: (r) => fmt(r.createdAt) },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'activity' && (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
          <Card title="Streak">
            {data.streak ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <Stat label="Current" value={data.streak.currentStreak} />
                  <Stat label="Longest" value={data.streak.longestStreak} />
                  <Stat label="Active days" value={data.streak.totalActiveDays} />
                </div>
                <Field label="Last active" value={fmtDay(data.streak.lastActiveDate)} />
                <Field label="Freezes available / used" value={`${data.streak.freezesAvailable} / ${data.streak.freezesUsed}`} />
                <div className="mt-3">
                  <Table
                    rows={data.streak.history}
                    empty="No history"
                    cols={[
                      { h: 'Day', r: (r) => fmtDay(r.date) },
                      { h: 'Challenge', r: (r) => (r.challengeCompleted ? '✓' : '') },
                      { h: 'Questions', right: true, r: (r) => r.questionsAttempted },
                      { h: 'Correct', right: true, r: (r) => r.correctAnswers },
                      { h: 'Freeze', r: (r) => (r.frozeStreak ? '❄' : '') },
                    ]}
                  />
                </div>
              </>
            ) : <div className="text-sm text-content-muted">No streak yet</div>}
          </Card>
          <div className="flex flex-col gap-3">
            <Card title={`Study plans (${data.studyPlans.length})`}>
              <Table
                rows={data.studyPlans}
                empty="No study plans"
                cols={[
                  { h: 'Exam', r: (r) => <span className="font-bold">{r.exam?.name || '—'}</span> },
                  { h: 'Exam date', r: (r) => fmtDay(r.examDate) },
                  { h: 'Status', r: (r) => <Pill tone={statusTone(r.status)}>{r.status}</Pill> },
                ]}
              />
            </Card>
            <Card title="Revision queue">
              {Object.keys(s.revision).length === 0 ? <div className="text-sm text-content-muted">Empty</div> : Object.entries(s.revision).map(([k, v]) => <Field key={k} label={k} value={v} />)}
            </Card>
            <Card title={<span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Community questions ({s.communityQuestions})</span>}>
              <Table rows={data.questions} empty="No questions asked" cols={[{ h: 'Question', r: (r) => r.question }, { h: 'Date', right: true, r: (r) => fmt(r.createdAt) }]} />
            </Card>
            <Card title={`Community answers (${s.communityAnswers})`}>
              <Table rows={data.answers} empty="No answers" cols={[{ h: 'Answer', r: (r) => (r.body || '').slice(0, 140) }, { h: 'Date', right: true, r: (r) => fmt(r.createdAt) }]} />
            </Card>
          </div>
        </div>
      )}
      </div>
    </ViewContext.Provider>
  );
}

function ExamTable({ rows, fill }) {
  return (
    <Table
      fill={fill}
      rows={rows}
      empty="No exam attempts"
      cols={[
        { h: 'Test', r: (r) => <span className="font-bold inline-block min-w-[200px]">{r.practiceTest?.title || 'Deleted test'}</span> },
        { h: 'Status', r: (r) => <Pill tone={statusTone(r.status)}>{r.status}</Pill> },
        { h: 'Score', right: true, r: (r) => `${num(r.score, 1)}${r.practiceTest?.totalMarks ? ` / ${r.practiceTest.totalMarks}` : ''}` },
        { h: 'Correct', right: true, r: (r) => r.correctCount },
        { h: 'Wrong', right: true, r: (r) => r.wrongCount },
        { h: 'Accuracy', right: true, r: (r) => `${num(r.accuracy)}%` },
        { h: 'Rank', right: true, r: (r) => r.rank ?? '—' },
        { h: 'Time', right: true, r: (r) => dur((r.totalTime || 0) / 1000) },
        { h: 'Date', right: true, r: (r) => fmt(r.submittedAt || r.createdAt) },
      ]}
    />
  );
}

function QuizTable({ rows, fill }) {
  return (
    <Table
      fill={fill}
      rows={rows}
      empty="No quiz attempts"
      cols={[
        { h: 'Quiz', r: (r) => <span className="font-bold inline-block min-w-[200px]">{r.quiz?.title || 'Deleted quiz'}</span> },
        { h: 'Status', r: (r) => <Pill tone={statusTone(r.status)}>{r.status}</Pill> },
        { h: 'Score', right: true, r: (r) => `${num(r.score, 1)} / ${r.totalMarks || r.quiz?.totalMarks || 0}` },
        { h: 'Correct', right: true, r: (r) => r.correctCount },
        { h: 'Wrong', right: true, r: (r) => r.wrongCount },
        { h: 'Skipped', right: true, r: (r) => r.skippedCount },
        { h: 'Accuracy', right: true, r: (r) => `${num(r.accuracy)}%` },
        { h: 'Rank', right: true, r: (r) => r.rank ?? '—' },
        { h: 'Time', right: true, r: (r) => dur(r.totalTime) },
        { h: 'Date', right: true, r: (r) => fmt(r.submittedAt || r.createdAt) },
      ]}
    />
  );
}
