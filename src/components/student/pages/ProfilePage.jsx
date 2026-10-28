'use client';

import { ProfilePageSkeleton } from '../../common/skeletons/PageSkeletons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Facebook,
  Flame,
  History,
  Instagram,
  LogOut,
  Mail,
  MapPin,
  Copy,
  BrainCircuit,
  Phone,
  Swords,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Twitter,
  UserCheck,
  Users,
  Wallet,
  Youtube,
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../../../lib/api';
import { handleAuthError } from '../../../lib/utils/authUtils';
import { formatTimeSpent } from '../../../lib/utils/timeFormat';
import Button from '../../common/ui/Button';
import ProgressBar from '../../common/ui/ProgressBar';
import ReferralBanner from '../ReferralBanner';
import TicketCard from '../TicketCard';
import useTranslate from '../../../hooks/useTranslate';

const formatCurrency = (value) => `Rs.${Number(value || 0).toLocaleString('en-IN')}`;

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

const SOCIAL_ICONS = {
  instagram: { icon: Instagram, color: 'text-content-primary' },
  facebook: { icon: Facebook, color: 'text-content-primary' },
  x: { icon: Twitter, color: 'text-content-primary' },
  youtube: { icon: Youtube, color: 'text-content-primary' },
};

const Avatar = ({ student, sizeClass }) => (
  student?.profilePicture ? (
    <Image
      src={student.profilePicture}
      alt={student?.name || 'Profile'}
      width={112}
      height={112}
      className={`${sizeClass} rounded-lg xl:rounded-2xl border border-white dark:border-slate-900 object-cover bg-background-surface-secondary flex-shrink-0`}
    />
  ) : (
    <div className={`${sizeClass} rounded-lg xl:rounded-2xl border border-white dark:border-slate-900 flex items-center justify-center bg-slate-800 dark:bg-slate-700 text-primary-400 font-bold flex-shrink-0`}>
      {student?.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  )
);

// Decorative barcode derived from a string (the referral code), like the strip on an admit card.
const gradeFor = (readiness) => {
  if (readiness >= 90) return 'A+';
  if (readiness >= 80) return 'A';
  if (readiness >= 70) return 'B+';
  if (readiness >= 60) return 'B';
  if (readiness >= 50) return 'C';
  return readiness > 0 ? 'D' : '—';
};

const ProfilePage = () => {
  const { translate } = useTranslate();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [streak, setStreak] = useState(null);
  const [quizzesAttempted, setQuizzesAttempted] = useState(0);
  const [quizStats, setQuizStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile', 'bank', 'settings'

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileRes = await API.getProfile();
      if (profileRes?.success) {
        setStudent(profileRes.user);
      }

      try {
        const bankRes = await API.getBankDetails();
        if (bankRes?.success) {
          setBankDetails(bankRes.bankDetail);
        }
      } catch {
        setBankDetails(null);
      }

      try {
        const streakRes = await API.request('/api/streak');
        if (streakRes?.success) setStreak(streakRes.data);
      } catch {
        setStreak(null);
      }

      try {
        const analyticsRes = await API.getAnalytics();
        const quiz = analyticsRes?.success ? analyticsRes.data?.quiz : null;
        setQuizStats(quiz || null);
        setQuizzesAttempted(quiz?.totalAttempts || 0);
      } catch {
        setQuizStats(null);
        setQuizzesAttempted(0);
      }
    } catch (error) {
      handleAuthError(error, router);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const secureLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/login');
    toast.success(translate('Logged out successfully.'));
  };

  const socialLinks = useMemo(
    () => Object.entries(student?.socialLinks || {}).filter(([key, url]) => SOCIAL_ICONS[key] && url),
    [student?.socialLinks]
  );

  const quizSubjectAccuracy = useMemo(
    () => (quizStats?.subjectWise || [])
      .filter((x) => x?.name && typeof x.avgAccuracy === 'number')
      .sort((a, b) => b.avgAccuracy - a.avgAccuracy)
      .slice(0, 5),
    [quizStats]
  );

  const subjectAccuracy = useMemo(() => {
    const map = student?.performanceMetrics?.examStats?.subjectAccuracy || {};
    return Object.entries(map)
      .filter(([key, value]) => typeof value === 'number' && !OBJECT_ID_RE.test(key))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [student]);

  const statTiles = useMemo(
    () => [
      { label: 'Day streak', value: streak?.currentStreak ?? 0, icon: Flame },
      { label: 'Followers', value: student?.followersCount || 0, icon: Users },
      { label: 'Following', value: student?.followingCount || 0, icon: UserCheck },
      { label: 'Profile views', value: student?.profileViews || 0, icon: Eye },
      { label: 'Referrals', value: student?.referralCount || 0, icon: Sparkles },
      { label: 'Referral Rewards', value: formatCurrency(student?.walletBalance || 0), icon: Wallet },
    ],
    [streak, student]
  );

  const copyReferralCode = () => {
    const code = student?.referralCode;
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success(translate('Code copied to clipboard!'), { position: 'top-center', duration: 2000 });
  };

  const renderStatTile = (item) => (
    <div key={item.label} className="relative overflow-hidden flex flex-col justify-center hover:bg-background-surface ring-1 ring-primary-200 dark:ring-white/20 px-2.5 py-1.5 transition-colors" style={{ borderRadius: 'var(--radius)' }}>
      <item.icon className="absolute -right-1.5 -bottom-1.5 w-9 h-9 text-primary-600/10 dark:text-white/10" />
      <p className="relative text-base xl:text-xl font-bold font-outfit leading-none text-primary-600 truncate">{item.value}</p>
      <p className="relative mt-1 text-[8px] xl:text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75 leading-tight break-words">{translate(item.label)}</p>
    </div>
  );

  const accountDetails = [
    { label: 'Email', value: student?.email || translate('Not added'), icon: Mail },
    { label: 'Phone', value: student?.phone || translate('Not added'), icon: Phone },
    { label: 'City', value: student?.city ? `${student.city}${student.state ? `, ${student.state}` : ''}` : translate('Not added'), icon: MapPin },
    { label: 'Target exams', value: student?.primaryTargetExam || translate('All Exams'), icon: Target },
    { label: 'Current Plan', value: student?.subscriptionStatus === 'PRO' ? 'PRO' : 'FREE', icon: ShieldCheck },
    {
      label: 'Joined',
      value: student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : translate('Unknown'),
      icon: Clock,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-page font-outfit">
        <div className="py-2 xl:py-4"><ProfilePageSkeleton /></div>
      </div>
    );
  }

  const isPro = student?.subscriptionStatus === 'PRO';
  const completion = student?.profileCompletion;

  return (
    <div className="min-h-screen animate-fade-in pb-8 xl:pb-12 selection:bg-primary-600 selection:text-white">
      <Head>
        <title>{`${translate('My Profile')} | ${student?.name || translate('Student')}`}</title>
      </Head>

      <div className="container mx-auto space-y-2 xl:space-y-4 mt-4 mb-4 xl:mb-4">

        {/* Hero — "Student admit card": a hall-ticket styled profile with a perforated rank stub */}
        <section
          className="relative overflow-hidden text-content-primary ring-1 ring-primary-200 dark:ring-white/10 bg-background-surface"
          style={{ borderRadius: 'var(--radius)' }}
        >

          {/* Ticket header strip */}
          <div className="relative flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-3 sm:px-4 xl:px-6 py-2 dark:bg-black/25 border-b border-primary-200 dark:border-white/15">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Award className="w-4 h-4 text-primary-600 shrink-0" />
                <span className="text-[10px] xl:text-xs font-bold uppercase tracking-[0.08em] tracking-[0.08em] truncate">AajExam · {translate('Student profile')}</span>
              </div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(student?.badges?.length ? student.badges : ['Student']).map((badge, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-primary-600 ring-1 ring-primary-300 dark:text-white dark:ring-white/30 text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.08em]"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <Award className="w-3 h-3" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
              {isPro && student?.subscriptionExpiry && (
                <p className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="text-[8px] xl:text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/60">{translate('Current Plan')}</span>
                  <span className="text-[10px] xl:text-xs font-bold">{translate('till {date}', { date: new Date(student.subscriptionExpiry).toLocaleDateString() })}</span>
                </p>
              )}
              <span
                className={`shrink-0 px-2.5 py-0.5 text-[10px] xl:text-xs font-bold uppercase tracking-[0.08em] ${isPro ? 'text-on-primary bg-primary-600' : 'bg-background-surface-secondary text-content-secondary ring-1 ring-slate-300 dark:bg-white/15 dark:ring-white/30'}`}
              >
                {isPro ? 'PRO' : translate('FREE')}
              </span>
            </div>
          </div>

          <div className="relative grid grid-cols-1 xl:grid-cols-[1fr_380px]">
            {/* Main ticket body */}
            <div className="p-3 xl:p-4 space-y-3">
              <div className="flex items-start gap-4 xl:gap-6">
                {/* Passport-style photo */}
                <div className="shrink-0 bg-background-surface p-1" style={{ borderRadius: 'var(--radius)' }}>
                  <Avatar student={student} sizeClass="w-16 h-20 sm:w-20 sm:h-24 xl:w-24 xl:h-28 text-3xl xl:text-4xl" />
                </div>

                <div className="flex-1 min-w-0 space-y-2.5">
                  {/* Username, target exams, registered on, city and plan share one row */}
                  <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
                    <div className="min-w-0">
                      <p className="text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/60">{translate('Username')}</p>
                      <p className="text-sm xl:text-base font-bold tracking-wide text-primary-600 truncate">@{student?.username || 'guest'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={copyReferralCode}
                      title={translate('Copy')}
                      className="group min-w-0 text-left active:scale-95 transition-transform"
                    >
                      <p className="text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/60">{translate('Referral code')}</p>
                      <p className="flex items-center gap-1.5 text-sm xl:text-base font-bold font-mono tracking-[0.08em] text-primary-600">
                        {student?.referralCode || 'AAJEXAM'}
                        <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                      </p>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h1 className="text-2xl xl:text-4xl font-bold font-outfit tracking-tight leading-none break-words">
                      {student?.name || translate('Student')}
                    </h1>
                    {socialLinks.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {socialLinks.map(([key, url]) => {
                          const { icon: Icon } = SOCIAL_ICONS[key];
                          return (
                            <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key} className="p-2 bg-background-surface ring-1 ring-primary-200 text-primary-600 dark:ring-white/25 dark:text-white transition-colors">
                              <Icon className="w-4 h-4" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {student?.bio && <p className="hidden sm:block text-xs xl:text-sm font-medium text-content-secondary dark:text-white/80 leading-relaxed">{student.bio}</p>}
                </div>
              </div>
              {/* Phones: bio gets its own full-width row under the photo */}
              {student?.bio && <p className="sm:hidden text-xs font-medium text-content-secondary dark:text-white/80 leading-relaxed">{student.bio}</p>}

              {/* Account details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary-600" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/80">{translate('Account details')}</p>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-3 grid-flow-dense gap-2">
                  {accountDetails.map((item) => (
                    <div key={item.label} className={`flex items-center gap-2 px-2 py-1.5 bg-white/80 ring-1 ring-primary-200 dark:bg-white/10 dark:ring-white/20 min-w-0 ${['Email', 'City'].includes(item.label) ? 'col-span-2 xl:col-span-1' : ''}`} style={{ borderRadius: 'var(--radius)' }}>
                      <div className="w-7 h-7 flex items-center justify-center text-primary-600 flex-shrink-0 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] xl:text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/70">{translate(item.label)}</p>
                        <p className="text-xs xl:text-sm font-bold truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer: actions, socials and barcode */}
              <footer className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-dashed border-border-primary">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                  {student?.username && (
                    <Button variant="secondary" size="sm" icon={Eye} className="w-full justify-center rounded-xl text-xs font-bold [&_.btn-label]:whitespace-normal [&_.btn-label]:text-center [&_.btn-label]:leading-tight" onClick={() => router.push(`/@${student.username}`)}>
                      {translate('Public profile')}
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" icon={Settings} className="w-full justify-center rounded-xl text-xs font-bold [&_.btn-label]:whitespace-normal [&_.btn-label]:text-center [&_.btn-label]:leading-tight" onClick={() => router.push('/student/settings')}>
                    {translate('Settings')}
                  </Button>
                  <Button variant="secondary" size="sm" icon={Trophy} className="w-full justify-center rounded-xl text-xs font-bold [&_.btn-label]:whitespace-normal [&_.btn-label]:text-center [&_.btn-label]:leading-tight" onClick={() => router.push('/student/all-india-rank')}>
                    {translate('All India Rank')}
                  </Button>
                  <Button variant="secondary" size="sm" icon={ShieldCheck} className="w-full justify-center rounded-xl text-xs font-bold [&_.btn-label]:whitespace-normal [&_.btn-label]:text-center [&_.btn-label]:leading-tight" onClick={() => router.push('/student/subscription')}>
                    {translate('Subscription')}
                  </Button>
                  <Button variant="secondary" size="sm" icon={Users} className="w-full justify-center rounded-xl text-xs font-bold [&_.btn-label]:whitespace-normal [&_.btn-label]:text-center [&_.btn-label]:leading-tight" onClick={() => router.push('/student/referral-history')}>
                    {translate('My Referrals')}
                  </Button>
                  <Button variant="secondary" size="sm" icon={CreditCard} className="w-full justify-center rounded-xl text-xs font-bold [&_.btn-label]:whitespace-normal [&_.btn-label]:text-center [&_.btn-label]:leading-tight" onClick={() => router.push('/student/payment-history')}>
                    {translate('Payment History')}
                  </Button>
                  <Button variant="secondary" size="sm" icon={Bookmark} className="w-full justify-center rounded-xl text-xs font-bold [&_.btn-label]:whitespace-normal [&_.btn-label]:text-center [&_.btn-label]:leading-tight" onClick={() => router.push('/student/bookmarks')}>
                    {translate('Bookmarks')}
                  </Button>
                  <Button variant="secondary" size="sm" icon={Swords} className="w-full justify-center rounded-xl text-xs font-bold [&_.btn-label]:whitespace-normal [&_.btn-label]:text-center [&_.btn-label]:leading-tight" onClick={() => router.push('/student/my-challenges')}>
                    {translate('My Challenges')}
                  </Button>
                </div>
              </footer>
            </div>

            {/* Perforated rank stub */}
            <div className="relative p-3 xl:p-4 dark:bg-black/20 border-t border-dashed border-primary-300 dark:border-white/35 xl:border-t-0 xl:border-l flex flex-col gap-2.5">
              <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: 'var(--radius-sm)' }} />
              <span className="xl:hidden absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: 'var(--radius-sm)' }} />
              <span className="hidden xl:block absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: 'var(--radius-sm)' }} />

              {/* Profile counters: streak, followers, following, views, referrals, referral rewards */}
              <div className="grid grid-cols-2 auto-rows-fr gap-1.5 pb-2.5 border-b border-dashed border-primary-300 dark:border-white/35 flex-1">
                {statTiles.map(renderStatTile)}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Trophy className="w-4 h-4 text-primary-600 shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/80 truncate">{translate('All India Rank')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/student/all-india-rank')}
                  className="inline-flex items-center gap-1 shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-600 hover:underline"
                >
                  {translate('View Rank')}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                <div className="ring-1 ring-slate-200 dark:ring-white/20 px-3 py-2" style={{ borderRadius: 'var(--radius)' }}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/70 leading-none">{translate('All India Rank')}</p>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <p className="text-2xl font-bold font-outfit leading-tight text-primary-600">{student?.examAIR ? `#${student.examAIR.rank}` : '—'}</p>
                    <p className="text-[10px] font-bold text-content-secondary dark:text-white/70 text-right leading-tight">
                      {student?.examAIR ? translate('of {total}', { total: student.examAIR.total }) : translate('No exams yet')}
                      {student?.examAIR && <><br />{translate('{time} spent', { time: formatTimeSpent(student.examAIR.totalTimeSpent, 'exam') })}</>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[{ label: 'State Rank', data: student?.stateRank }, { label: 'City Rank', data: student?.cityRank }].map(({ label, data }) => (
                  <div key={label} className="ring-1 ring-slate-200 dark:ring-white/20 px-3 py-2 min-w-0" style={{ borderRadius: 'var(--radius)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/70 leading-none">{translate(label)}</p>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <p className="text-2xl font-bold font-outfit leading-tight text-primary-600">{data?.rank ? `#${data.rank}` : '—'}</p>
                      <p className="text-[10px] font-bold text-content-secondary dark:text-white/70 text-right leading-tight">
                        {!data ? translate('Not added') : data.rank ? translate('of {total}', { total: data.total }) : translate('No exams yet')}
                      </p>
                    </div>
                    {data?.place && <p className="text-[9px] font-bold text-content-muted dark:text-white/60 truncate">{data.place}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sub-tab navigation — green segmented bar */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1 p-1 bg-background-surface ring-1 ring-primary-200 dark:ring-0 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 relative z-20 w-full sm:w-fit max-w-full" style={{ borderRadius: 'var(--radius)' }}>
          {[
            { id: 'profile', label: 'My Profile', icon: Award },
            { id: 'bank', label: 'Bank Details', icon: Wallet },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`border border-primary-600 flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 font-bold uppercase text-[10px] xl:text-[11px] tracking-[0.08em] transition-all whitespace-nowrap min-w-0 ${activeSubTab === tab.id ? 'bg-primary-600 text-on-primary dark:bg-white dark:text-primary-700' : 'text-content-secondary dark:text-white/90 dark:hover:bg-white/15'}`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeSubTab === tab.id ? 'text-white dark:text-primary-600' : 'text-primary-600'}`} />
              {translate(tab.label)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeSubTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 xl:space-y-6"
            >
              {/* Profile completion */}
              {completion && !completion.isComplete && (
                <TicketCard
                  icon={Target}
                  title={translate('Complete your profile')}
                  subtitle={translate('A complete profile helps you stand out and unlocks rewards.')}
                  right={<span className="px-2.5 py-1 text-primary-600 ring-1 ring-primary-300 dark:text-white dark:ring-white/30 text-sm font-bold">{completion.percentage}%</span>}
                >
                  <ProgressBar progress={completion.percentage} variant="primary" height="md" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {completion.fields.map((field) => (
                      <div key={field.field} className={`flex items-center gap-3 p-3 border border-dashed ${field.completed ? 'border-primary-500/40' : 'border-border-primary'}`} style={{ borderRadius: 'var(--radius)' }}>
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${field.completed ? 'text-primary-600' : 'text-slate-300 dark:text-slate-600'}`} />
                        <span className={`text-sm font-semibold ${field.completed ? 'text-content-primary' : 'text-content-secondary'}`}>{field.name}</span>
                      </div>
                    ))}
                  </div>
                </TicketCard>
              )}

              {/* Exam performance + Quiz performance: one row on desktop, two rows on phones */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6 items-stretch">
                {/* Exam performance (report card) */}
                <TicketCard
                  className="h-full"
                  icon={TrendingUp}
                  title={translate('Exam performance')}
                  subtitle={translate('Preparing for {exam}.', { exam: student?.primaryTargetExam || translate('All Exams') })}
                  right={
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => router.push('/student/exam-history')}
                        className="inline-flex items-center gap-1.5 p-2 sm:px-3 bg-background-surface border border-border-primary text-black hover:bg-background-surface-secondary dark:text-white dark:hover:bg-slate-700 rounded-lg xl:rounded-xl text-[10px] font-bold uppercase tracking-[0.08em] transition-colors"
                      >
                        <History className="w-3.5 h-3.5 shrink-0" />
                        <span className="sr-only sm:not-sr-only">{translate('Exam History')}</span>
                      </button>
                      <div
                        className="flex flex-col items-center justify-center w-10 h-10 sm:w-14 sm:h-14 xl:w-16 xl:h-16 border-[3px] border-double border-primary-700 text-primary-600 dark:border-white/80 dark:text-white"
                        style={{ borderRadius: 'var(--radius)', transform: 'rotate(-8deg)' }}
                        title={translate('Grade')}
                      >
                        <span className="text-base sm:text-xl xl:text-2xl font-bold font-outfit leading-none">{gradeFor(student?.performanceMetrics?.examStats?.overallReadiness || 0)}</span>
                        <span className="text-[5px] sm:text-[7px] xl:text-[8px] font-bold uppercase tracking-[0.1em] tracking-[0.08em] mt-0.5">{translate('Grade')}</span>
                      </div>
                    </div>
                  }
                >
                  <div className="grid grid-cols-3 gap-2 xl:gap-3">
                    {[
                      { label: 'Overall readiness', value: `${student?.performanceMetrics?.examStats?.overallReadiness || 0}%` },
                      { label: 'Tests attempted', value: student?.performanceMetrics?.examStats?.mockTestsAttempted || 0 },
                      { label: 'Avg score', value: `${student?.performanceMetrics?.examStats?.averageMockScore || 0}%` },
                    ].map((item) => (
                      <div key={item.label} className="border border-dashed border-border-primary bg-background-surface-secondary p-3 text-center" style={{ borderRadius: 'var(--radius)' }}>
                        <p className="text-2xl xl:text-3xl font-bold font-outfit tracking-tight text-primary-600">{item.value}</p>
                        <p className="text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary mt-1">{translate(item.label)}</p>
                      </div>
                    ))}
                  </div>

                  {subjectAccuracy.length > 0 && (
                    <div className="space-y-2 xl:space-y-4 mt-5">
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-content-secondary">
                        <BookOpen className="w-4 h-4" /> Subject-wise accuracy
                      </p>
                      <div className="space-y-2 xl:space-y-4">
                        {subjectAccuracy.map(([subject, score]) => (
                          <ProgressBar key={subject} progress={score} variant="primary" height="sm" label={subject} />
                        ))}
                      </div>
                    </div>
                  )}
                </TicketCard>

                <TicketCard
                  className="h-full"
                  icon={BrainCircuit}
                  title={translate('Quiz performance')}
                  subtitle={translate('Preparing for {exam}.', { exam: student?.primaryTargetExam || translate('All Exams') })}
                  right={
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => router.push('/student/quiz-history')}
                        className="inline-flex items-center gap-1.5 p-2 sm:px-3 bg-background-surface border border-border-primary text-black hover:bg-background-surface-secondary dark:text-white dark:hover:bg-slate-700 rounded-lg xl:rounded-xl text-[10px] font-bold uppercase tracking-[0.08em] transition-colors"
                      >
                        <History className="w-3.5 h-3.5 shrink-0" />
                        <span className="sr-only sm:not-sr-only">{translate('Quiz History')}</span>
                      </button>
                      <div
                        className="flex flex-col items-center justify-center w-10 h-10 sm:w-14 sm:h-14 xl:w-16 xl:h-16 border-[3px] border-double border-primary-700 text-primary-600 dark:border-white/80 dark:text-white"
                        style={{ borderRadius: 'var(--radius)', transform: 'rotate(-8deg)' }}
                        title={translate('Grade')}
                      >
                        <span className="text-base sm:text-xl xl:text-2xl font-bold font-outfit leading-none">{gradeFor(quizStats?.avgAccuracy || 0)}</span>
                        <span className="text-[5px] sm:text-[7px] xl:text-[8px] font-bold uppercase tracking-[0.1em] tracking-[0.08em] mt-0.5">{translate('Grade')}</span>
                      </div>
                    </div>
                  }
                >
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 xl:gap-3">
                    {[
                      { label: 'Quizzes attempted', value: quizzesAttempted },
                      { label: 'Avg Accuracy', value: `${quizStats?.avgAccuracy || 0}%` },
                      { label: 'Avg score', value: `${quizStats?.avgScore || 0}%` },
                      { label: 'Best Score', value: `${quizStats?.bestScore || 0}%` },
                    ].map((item) => (
                      <div key={item.label} className="border border-dashed border-border-primary bg-background-surface-secondary p-3 text-center" style={{ borderRadius: 'var(--radius)' }}>
                        <p className="text-2xl xl:text-3xl font-bold font-outfit tracking-tight text-primary-600">{item.value}</p>
                        <p className="text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.08em] text-content-secondary mt-1">{translate(item.label)}</p>
                      </div>
                    ))}
                  </div>

                  {quizSubjectAccuracy.length > 0 && (
                    <div className="space-y-2 xl:space-y-4 mt-5">
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-content-secondary">
                        <BookOpen className="w-4 h-4" /> Subject-wise accuracy
                      </p>
                      <div className="space-y-2 xl:space-y-4">
                        {quizSubjectAccuracy.map((x) => (
                          <ProgressBar key={x.subjectId || x.name} progress={x.avgAccuracy} variant="primary" height="sm" label={x.name} />
                        ))}
                      </div>
                    </div>
                  )}
                </TicketCard>
              </div>

              <ReferralBanner user={student} />
            </motion.div>
          )}

          {activeSubTab === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TicketCard
                icon={Wallet}
                title={translate('Payout details')}
                subtitle={translate('Add your bank details to receive Referral Rewards')}
                right={bankDetails ? <span className="px-3 py-1 text-on-primary text-[10px] font-bold uppercase tracking-[0.08em] bg-primary-600">{translate('Linked')}</span> : null}
              >
                {bankDetails ? (
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                    {/* Bank card visual */}
                    <div className="relative overflow-hidden w-full max-w-md p-5 text-white ring-1 ring-white/10 bg-slate-950" style={{ borderRadius: 'var(--radius)' }}>
                      <div className="relative flex items-center justify-between">
                        <p className="text-sm font-bold uppercase tracking-[0.08em] truncate">{bankDetails.bankName}</p>
                        <Building2 className="w-6 h-6 text-primary-300 shrink-0" />
                      </div>
                      <div className="relative mt-5 w-11 h-8 bg-background-surface" style={{ borderRadius: 'var(--radius)' }} />
                      <p className="relative mt-4 font-mono text-lg xl:text-xl font-bold tracking-[0.08em]">•••• •••• {bankDetails.accountNumber?.slice(-4) || '----'}</p>
                      <p className="relative mt-3 text-xs font-bold uppercase tracking-[0.08em] text-white/80 truncate">{bankDetails.accountHolderName || translate('Account holder')}</p>
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-medium text-content-secondary">
                        {translate('{name} · Account ending {last4}', { name: bankDetails.accountHolderName || translate('Account holder'), last4: bankDetails.accountNumber?.slice(-4) || '----' })}
                      </p>
                      <Button variant="primary" className="px-6 py-3 rounded-xl text-sm font-bold" onClick={() => router.push('/student/settings')}>
                        {translate('Update')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 xl:p-10 border border-dashed border-border-primary text-center space-y-5" style={{ borderRadius: 'var(--radius)' }}>
                    <div className="w-16 h-16 text-primary-600 flex items-center justify-center mx-auto border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl xl:text-2xl font-bold font-outfit tracking-tight text-content-primary">{translate('No bank account linked')}</h3>
                      <p className="text-sm font-medium text-content-secondary max-w-md mx-auto">
                        {translate('Add your bank details to receive Referral Rewards')}
                      </p>
                    </div>
                    <Button variant="primary" className="px-10 py-4 rounded-2xl text-sm font-bold" onClick={() => router.push('/student/settings')}>
                      {translate('Add bank details')}
                    </Button>
                  </div>
                )}
              </TicketCard>
            </motion.div>
          )}

          {activeSubTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 xl:space-y-6"
            >
              <TicketCard icon={Settings} title={translate('Quick actions')} subtitle={translate('Jump to the places you are most likely to need next.')}>
                <div className="space-y-3">
                  {[
                    { label: 'Manage subscription', icon: CreditCard, onClick: () => router.push('/student/subscription') },
                    { label: 'Review account settings', icon: Settings, onClick: () => router.push('/student/settings') },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-background-surface-secondary border-b-2 border-dashed border-primary-500/40 text-left transition-colors"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 flex items-center justify-center text-primary-600 shrink-0 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}><item.icon className="w-4 h-4" /></span>
                        <span className="text-sm font-bold text-content-primary truncate">{translate(item.label)}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </TicketCard>

              <TicketCard icon={ShieldCheck} title={translate('Account safety')}>
                <p className="text-sm font-medium text-content-secondary leading-relaxed mb-4">
                  {translate('Keep your profile, bank details, and password up to date so your account stays secure and payouts go through smoothly.')}
                </p>
                <button
                  onClick={secureLogout}
                  className="w-full flex items-center justify-center gap-3 py-3.5 text-sm font-bold uppercase tracking-wide bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </TicketCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
