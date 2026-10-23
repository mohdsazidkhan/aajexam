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
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Facebook,
  Flame,
  Instagram,
  LogOut,
  Mail,
  MapPin,
  Phone,
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
  instagram: { icon: Instagram, color: 'text-black dark:text-white' },
  facebook: { icon: Facebook, color: 'text-black dark:text-white' },
  x: { icon: Twitter, color: 'text-black dark:text-white' },
  youtube: { icon: Youtube, color: 'text-black dark:text-white' },
};

const Avatar = ({ student, sizeClass }) => (
  student?.profilePicture ? (
    <Image
      src={student.profilePicture}
      alt={student?.name || 'Profile'}
      width={112}
      height={112}
      className={`${sizeClass} rounded-lg xl:rounded-2xl border-2 border-white dark:border-slate-900 shadow-sm object-cover bg-slate-200 dark:bg-slate-700 flex-shrink-0`}
    />
  ) : (
    <div className={`${sizeClass} rounded-lg xl:rounded-2xl border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center bg-slate-800 dark:bg-slate-700 text-primary-400 font-black flex-shrink-0`}>
      {student?.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  )
);

// Decorative barcode derived from a string (the referral code), like the strip on an admit card.
const Barcode = ({ value }) => {
  const bars = Array.from(String(value || 'AAJEXAM').toUpperCase()).flatMap((ch) => {
    const c = ch.charCodeAt(0);
    return [1 + (c % 3), 1 + ((c >> 2) % 2)];
  });
  return (
    <div className="flex items-stretch h-7" aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} className={i % 2 === 0 ? 'bg-slate-800 dark:bg-white/85' : 'bg-transparent'} style={{ width: w * 2 }} />
      ))}
    </div>
  );
};

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
        const quizAttemptsRes = await API.getMyQuizAttempts({ status: 'Completed', limit: 1 });
        if (quizAttemptsRes?.success) setQuizzesAttempted(quizAttemptsRes.pagination?.total || 0);
      } catch {
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
      { label: 'Wallet balance', value: formatCurrency(student?.walletBalance || 0), icon: Wallet },
    ],
    [streak, student]
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
          className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 text-slate-900 shadow-xl ring-1 ring-primary-200 dark:from-primary-700 dark:via-primary-800 dark:to-primary-950 dark:text-white dark:ring-white/10"
          style={{ borderRadius: 16 }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
          <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
          <div className="pointer-events-none absolute -bottom-28 right-24 w-80 h-80 bg-primary-300/15 blur-3xl" style={{ borderRadius: '50%' }} />

          {/* Ticket header strip */}
          <div className="relative flex items-center justify-between gap-3 px-4 xl:px-6 py-2 bg-primary-600/10 dark:bg-black/25 border-b border-primary-200 dark:border-white/15">
            <div className="flex items-center gap-2 min-w-0">
              <Award className="w-4 h-4 text-primary-600 dark:text-primary-300 shrink-0" />
              <span className="text-[10px] xl:text-xs font-black uppercase tracking-[0.25em] truncate">AajExam · {translate('Student profile')}</span>
            </div>
            <span
              className={`shrink-0 px-2.5 py-0.5 text-[10px] xl:text-xs font-black uppercase tracking-widest ${isPro ? 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-primary-950 shadow-[0_2px_12px_rgba(251,191,36,0.45)]' : 'bg-slate-200 text-slate-700 ring-1 ring-slate-300 dark:bg-white/15 dark:text-white dark:ring-white/30'}`}
            >
              {isPro ? 'PRO' : translate('FREE')}
            </span>
          </div>

          <div className="relative grid grid-cols-1 xl:grid-cols-[1fr_290px]">
            {/* Main ticket body */}
            <div className="p-4 xl:p-6 space-y-4">
              <div className="flex items-start gap-4 xl:gap-6">
                {/* Passport-style photo */}
                <div className="shrink-0 bg-white p-1 shadow-lg rotate-[-2deg]" style={{ borderRadius: 6 }}>
                  <Avatar student={student} sizeClass="w-20 h-24 sm:w-24 sm:h-28 xl:w-28 xl:h-32 text-3xl xl:text-5xl" />
                </div>

                <div className="flex-1 min-w-0 space-y-2.5">
                  <div>
                    <p className="text-[9px] xl:text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-white/60">{translate('Username')}</p>
                    <p className="text-sm xl:text-base font-black tracking-wide text-primary-700 dark:text-primary-200 truncate">@{student?.username || 'guest'}</p>
                  </div>
                  <h1 className="text-2xl xl:text-4xl font-black font-outfit tracking-tight leading-none break-words">
                    {student?.name || translate('Student')}
                  </h1>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 max-w-md">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">{translate('Target exams')}</p>
                      <p className="text-xs xl:text-sm font-bold truncate">{student?.primaryTargetExam || translate('All Exams')}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">{translate('Registered on')}</p>
                      <p className="text-xs xl:text-sm font-bold truncate">{student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : translate('Unknown')}</p>
                    </div>
                    {student?.city && (
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">{translate('City')}</p>
                        <p className="text-xs xl:text-sm font-bold truncate flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{student.city}{student.state && `, ${student.state}`}</p>
                      </div>
                    )}
                    {isPro && student?.subscriptionExpiry && (
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">{translate('Current Plan')}</p>
                        <p className="text-xs xl:text-sm font-bold truncate">{translate('till {date}', { date: new Date(student.subscriptionExpiry).toLocaleDateString() })}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {student?.bio && <p className="text-xs xl:text-sm font-medium text-slate-700 dark:text-white/80 leading-relaxed">{student.bio}</p>}

              {/* Scorecard strip: the profile counters live on the ticket itself */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {statTiles.map((item) => (
                  <div key={item.label} className="relative overflow-hidden bg-white/80 hover:bg-white ring-1 ring-primary-200 dark:bg-white/10 dark:hover:bg-white/15 dark:ring-white/20 px-2.5 py-2.5 transition-colors" style={{ borderRadius: 10 }}>
                    <item.icon className="absolute -right-1.5 -bottom-1.5 w-9 h-9 text-primary-600/10 dark:text-white/10" />
                    <p className="relative text-base xl:text-xl font-black font-outfit leading-none text-primary-700 dark:text-primary-200 truncate">{item.value}</p>
                    <p className="relative mt-1 text-[8px] xl:text-[9px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75 leading-tight truncate">{translate(item.label)}</p>
                  </div>
                ))}
              </div>

              {/* Footer: actions, socials and barcode */}
              <div className="flex flex-wrap items-end justify-between gap-3 pt-3 border-t border-dashed border-primary-300 dark:border-white/25">
                <div className="flex flex-wrap items-center gap-2">
                  {student?.username && (
                    <Button variant="secondary" size="sm" icon={Eye} className="rounded-xl text-xs font-black" onClick={() => router.push(`/u/${student.username}`)}>
                      {translate('Public profile')}
                    </Button>
                  )}
                  <Button variant="primary" size="sm" icon={Settings} className="rounded-xl text-xs font-black" onClick={() => router.push('/student/settings')}>
                    {translate('Settings')}
                  </Button>
                  {socialLinks.map(([key, url]) => {
                    const { icon: Icon } = SOCIAL_ICONS[key];
                    return (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key} className="p-2 bg-white hover:bg-primary-50 ring-1 ring-primary-200 text-primary-700 dark:bg-white/15 dark:hover:bg-white/25 dark:ring-white/25 dark:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
                <div className="hidden sm:block text-right">
                  <Barcode value={student?.referralCode || student?.username} />
                  <p className="mt-1 text-[9px] font-mono tracking-[0.3em] text-slate-500 dark:text-white/60">{student?.referralCode || 'AAJEXAM'}</p>
                </div>
              </div>
            </div>

            {/* Perforated rank stub */}
            <div className="relative p-4 xl:p-6 bg-primary-600/5 dark:bg-black/20 border-t border-dashed border-primary-300 dark:border-white/35 xl:border-t-0 xl:border-l space-y-3">
              <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />
              <span className="xl:hidden absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />
              <span className="hidden xl:block absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />

              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary-600 dark:text-primary-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-700 dark:text-white/80">{translate('All India Rank')}</p>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
                <div className="bg-white/80 ring-1 ring-primary-200 dark:bg-white/10 dark:ring-white/20 px-3 py-2" style={{ borderRadius: 10 }}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-white/70 leading-none">{translate('Exam AIR')}</p>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-3xl font-black font-outfit leading-tight text-primary-700 dark:text-primary-200">{student?.examAIR ? `#${student.examAIR.rank}` : '—'}</p>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-white/70 text-right leading-tight">
                      {student?.examAIR ? translate('of {total}', { total: student.examAIR.total }) : translate('No exams yet')}
                      {student?.examAIR && <><br />{translate('{time} spent', { time: formatTimeSpent(student.examAIR.totalTimeSpent, 'exam') })}</>}
                    </p>
                  </div>
                </div>
                <div className="bg-white/80 ring-1 ring-primary-200 dark:bg-white/10 dark:ring-white/20 px-3 py-2" style={{ borderRadius: 10 }}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-white/70 leading-none">{translate('Quiz AIR')}</p>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-3xl font-black font-outfit leading-tight">{student?.quizAIR ? `#${student.quizAIR.rank}` : '—'}</p>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-white/70 text-right leading-tight">
                      {student?.quizAIR ? translate('of {total}', { total: student.quizAIR.total }) : translate('No quizzes yet')}
                      {student?.quizAIR && <><br />{translate('{time} spent', { time: formatTimeSpent(student.quizAIR.totalTimeSpent, 'quiz') })}</>}
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full rounded-xl text-xs font-black" onClick={() => router.push('/student/leaderboard')}>
                {translate('View leaderboard')}
              </Button>
            </div>
          </div>
        </section>

        {/* Sub-tab navigation — green segmented bar */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1 p-1 bg-white ring-1 ring-primary-200 dark:ring-0 dark:bg-gradient-to-r dark:from-primary-700 dark:via-primary-800 dark:to-primary-900 shadow-md relative z-20 w-fit max-w-full" style={{ borderRadius: 12 }}>
          {[
            { id: 'profile', label: 'My Profile', icon: Award },
            { id: 'bank', label: 'Bank Details', icon: Wallet },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 font-black uppercase text-[10px] xl:text-[11px] tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${activeSubTab === tab.id ? 'bg-primary-600 text-white dark:bg-white dark:text-primary-700 shadow' : 'text-slate-600 hover:bg-primary-50 dark:text-white/90 dark:hover:bg-white/15'}`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeSubTab === tab.id ? 'text-white dark:text-primary-600' : 'text-primary-600 dark:text-primary-300'}`} />
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
                  right={<span className="px-2.5 py-1 bg-primary-600/10 text-primary-800 ring-1 ring-primary-300 dark:bg-white/15 dark:text-white dark:ring-white/30 text-sm font-black">{completion.percentage}%</span>}
                >
                  <ProgressBar progress={completion.percentage} variant="primary" height="md" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {completion.fields.map((field) => (
                      <div key={field.field} className={`flex items-center gap-3 p-3 border-2 border-dashed ${field.completed ? 'border-primary-500/40 bg-primary-500/5' : 'border-slate-200 dark:border-slate-700'}`} style={{ borderRadius: 10 }}>
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${field.completed ? 'text-primary-600' : 'text-slate-300 dark:text-slate-600'}`} />
                        <span className={`text-sm font-semibold ${field.completed ? 'text-content-primary' : 'text-content-secondary'}`}>{field.name}</span>
                      </div>
                    ))}
                  </div>
                </TicketCard>
              )}

              {/* Exam performance (report card) */}
              <TicketCard
                icon={TrendingUp}
                title={translate('Exam performance')}
                subtitle={translate('Preparing for {exam}.', { exam: student?.primaryTargetExam || translate('All Exams') })}
                right={
                  <div
                    className="flex flex-col items-center justify-center w-14 h-14 xl:w-16 xl:h-16 border-[3px] border-double border-primary-700 text-primary-800 dark:border-white/80 dark:text-white"
                    style={{ borderRadius: 12, transform: 'rotate(-8deg)' }}
                    title={translate('Grade')}
                  >
                    <span className="text-xl xl:text-2xl font-black font-outfit leading-none">{gradeFor(student?.performanceMetrics?.examStats?.overallReadiness || 0)}</span>
                    <span className="text-[7px] xl:text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">{translate('Grade')}</span>
                  </div>
                }
              >
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4">
                  {[
                    { label: 'Overall readiness', value: `${student?.performanceMetrics?.examStats?.overallReadiness || 0}%` },
                    { label: 'Quizzes attempted', value: quizzesAttempted },
                    { label: 'Tests attempted', value: student?.performanceMetrics?.examStats?.mockTestsAttempted || 0 },
                    { label: 'Avg score', value: `${student?.performanceMetrics?.examStats?.averageMockScore || 0}%` },
                  ].map((item) => (
                    <div key={item.label} className="border-2 border-dashed border-slate-200 dark:border-slate-700 bg-background-surface-secondary p-4 text-center" style={{ borderRadius: 12 }}>
                      <p className="text-2xl xl:text-3xl font-black font-outfit tracking-tight text-primary-600 dark:text-primary-300">{item.value}</p>
                      <p className="text-[9px] xl:text-[10px] font-black uppercase tracking-wider text-content-secondary mt-1">{translate(item.label)}</p>
                    </div>
                  ))}
                </div>

                {subjectAccuracy.length > 0 && (
                  <div className="space-y-2 xl:space-y-4 mt-5">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-content-secondary">
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

              {/* Badges */}
              <TicketCard icon={Award} title={translate('Badges')} subtitle={translate('Earned through activity and achievements.')}>
                <div className="flex flex-wrap gap-3">
                  {(student?.badges?.length ? student.badges : ['Student']).map((badge, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-primary-200 text-xs font-black uppercase tracking-wider border-2 border-dashed border-primary-400/70"
                      style={{ borderRadius: 10, transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)` }}
                    >
                      <Award className="w-3.5 h-3.5" />
                      {badge}
                    </span>
                  ))}
                </div>
              </TicketCard>

              {/* Account details — admit-card style form fields */}
              <TicketCard icon={ShieldCheck} title={translate('Account details')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {accountDetails.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 bg-background-surface-secondary border-b-2 border-dashed border-primary-500/40" style={{ borderRadius: 10 }}>
                      <div className="w-9 h-9 flex items-center justify-center bg-primary-500/10 text-primary-600 dark:text-primary-300 flex-shrink-0" style={{ borderRadius: 10 }}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-content-secondary">{translate(item.label)}</p>
                        <p className="text-sm font-bold text-content-primary truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TicketCard>

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
                right={bankDetails ? <span className="px-3 py-1 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-primary-950 text-[10px] font-black uppercase tracking-widest">{translate('Linked')}</span> : null}
              >
                {bankDetails ? (
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                    {/* Bank card visual */}
                    <div className="relative overflow-hidden w-full max-w-md p-5 text-white shadow-xl bg-gradient-to-br from-slate-800 via-slate-900 to-black ring-1 ring-white/10" style={{ borderRadius: 16 }}>
                      <div className="pointer-events-none absolute -top-16 -right-10 w-48 h-48 bg-primary-300/15 blur-3xl" style={{ borderRadius: '50%' }} />
                      <div className="relative flex items-center justify-between">
                        <p className="text-sm font-black uppercase tracking-widest truncate">{bankDetails.bankName}</p>
                        <Building2 className="w-6 h-6 text-primary-300 shrink-0" />
                      </div>
                      <div className="relative mt-5 w-11 h-8 bg-gradient-to-br from-amber-200 to-amber-500" style={{ borderRadius: 6 }} />
                      <p className="relative mt-4 font-mono text-lg xl:text-xl font-black tracking-[0.25em]">•••• •••• {bankDetails.accountNumber?.slice(-4) || '----'}</p>
                      <p className="relative mt-3 text-xs font-bold uppercase tracking-widest text-white/80 truncate">{bankDetails.accountHolderName || translate('Account holder')}</p>
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-medium text-content-secondary">
                        {translate('{name} · Account ending {last4}', { name: bankDetails.accountHolderName || translate('Account holder'), last4: bankDetails.accountNumber?.slice(-4) || '----' })}
                      </p>
                      <Button variant="primary" className="px-6 py-3 rounded-xl text-sm font-black" onClick={() => router.push('/student/settings')}>
                        {translate('Update')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 xl:p-10 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-5" style={{ borderRadius: 14 }}>
                    <div className="w-16 h-16 bg-primary-500/10 text-primary-600 dark:text-primary-300 flex items-center justify-center mx-auto" style={{ borderRadius: 14 }}>
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl xl:text-2xl font-black font-outfit tracking-tight text-content-primary">{translate('No bank account linked')}</h3>
                      <p className="text-sm font-medium text-content-secondary max-w-md mx-auto">
                        {translate('Add your bank details to receive Referral Rewards')}
                      </p>
                    </div>
                    <Button variant="primary" className="px-10 py-4 rounded-2xl text-sm font-black" onClick={() => router.push('/student/settings')}>
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
                      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-background-surface-secondary border-b-2 border-dashed border-primary-500/40 text-left hover:bg-primary-500/5 transition-colors"
                      style={{ borderRadius: 10 }}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 flex items-center justify-center bg-primary-500/10 text-primary-600 dark:text-primary-300 shrink-0" style={{ borderRadius: 10 }}><item.icon className="w-4 h-4" /></span>
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
                  className="w-full flex items-center justify-center gap-3 py-3.5 text-sm font-black uppercase tracking-wide bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors"
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
