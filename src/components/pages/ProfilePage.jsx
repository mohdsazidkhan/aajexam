'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
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
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import { handleAuthError } from '../../lib/utils/authUtils';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import ReferralBanner from '../ReferralBanner';
import { ProfileSkeleton } from '../skeletons/PrivateSkeletons';

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
      className={`${sizeClass} rounded-lg lg:rounded-2xl border-2 border-white dark:border-slate-900 shadow-sm object-cover bg-slate-200 dark:bg-slate-700 flex-shrink-0`}
    />
  ) : (
    <div className={`${sizeClass} rounded-lg lg:rounded-2xl border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center bg-slate-800 dark:bg-slate-700 text-primary-400 font-black flex-shrink-0`}>
      {student?.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  )
);

const ProfilePage = () => {
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
    toast.success('Logged out successfully.');
  };

  const copyReferralCode = () => {
    if (!student?.referralCode) return;
    navigator.clipboard.writeText(student.referralCode);
    toast.success('Referral code copied!');
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
      { label: 'Day streak', value: streak?.currentStreak ?? 0, icon: Flame, tone: 'bg-black/10 dark:bg-white/10 text-black dark:text-white' },
      { label: 'Followers', value: student?.followersCount || 0, icon: Users, tone: 'bg-primary-500/10 text-primary-700' },
      { label: 'Following', value: student?.followingCount || 0, icon: UserCheck, tone: 'bg-black/10 dark:bg-white/10 text-black dark:text-white' },
      { label: 'Profile views', value: student?.profileViews || 0, icon: Eye, tone: 'bg-black/10 dark:bg-white/10 text-black dark:text-white' },
      { label: 'Referrals', value: student?.referralCount || 0, icon: Sparkles, tone: 'bg-black/10 dark:bg-white/10 text-black dark:text-white' },
      { label: 'Wallet balance', value: formatCurrency(student?.walletBalance || 0), icon: Wallet, tone: 'bg-primary-500/10 text-primary-700' },
    ],
    [streak, student]
  );

  const accountDetails = [
    { label: 'Email', value: student?.email || 'Not added', icon: Mail },
    { label: 'Phone', value: student?.phone || 'Not added', icon: Phone },
    { label: 'City', value: student?.city || 'Not added', icon: MapPin },
    { label: 'Target exam', value: student?.primaryTargetExam || 'All Exams', icon: Target },
    { label: 'Current Plan', value: student?.subscriptionStatus === 'PRO' ? 'PRO' : 'FREE', icon: ShieldCheck },
    {
      label: 'Joined',
      value: student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Unknown',
      icon: Clock,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-page font-outfit">
        <div className="py-8 lg:py-12"><ProfileSkeleton /></div>
      </div>
    );
  }

  const isPro = student?.subscriptionStatus === 'PRO';
  const completion = student?.profileCompletion;

  return (
    <div className="min-h-screen animate-fade-in pb-24 selection:bg-primary-700 selection:text-white">
      <Head>
        <title>My Profile | {student?.name || 'Student'}</title>
      </Head>

      <div className="container mx-auto space-y-2 lg:space-y-4 lg:space-y-6 mt-4 mb-4 lg:mb-4">

        {/* Hero — single full-width card, responsive from mobile to desktop */}
        <Card className="p-5 lg:p-10 space-y-6" radius="3xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 lg:gap-8">
            <Avatar student={student} sizeClass="w-20 h-20 lg:w-28 lg:h-28 text-2xl lg:text-5xl" />

            <div className="flex-1 min-w-0 space-y-3 lg:space-y-4">
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <h1 className="text-xl lg:text-4xl font-black font-outfit tracking-tight leading-none text-content-primary">
                  {student?.name || 'Student'}
                </h1>
                <span className={`px-2.5 py-1 rounded-full text-[10px] lg:text-xs font-black uppercase ${isPro ?'bg-primary-700 text-white shadow-sm':'bg-slate-100 dark:bg-slate-700 text-content-secondary'}`}>
                  {isPro ? 'PRO' : 'FREE'}
                </span>
                {isPro && student?.subscriptionExpiry && (
                  <span className="text-xs font-semibold text-content-secondary">
                    till {new Date(student.subscriptionExpiry).toLocaleDateString()}
                  </span>
                )}
              </div>

              <p className="text-sm lg:text-base font-semibold text-content-secondary">@{student?.username || 'guest'}</p>

              {student?.city && (
                <p className="flex items-center gap-1.5 text-xs lg:text-sm font-medium text-content-secondary">
                  <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> {student.city}
                </p>
              )}

            </div>
          </div>

            <div className="flex flex-col items-start lg:items-end gap-2 lg:gap-3 lg:flex-shrink-0">
              <div className="flex items-center gap-2">
                {student?.username && (
                  <Button variant="secondary" size="sm" icon={Eye} className="rounded-xl text-xs font-black" onClick={() => window.open(`/u/${student.username}`, '_blank')}>
                    Public profile
                  </Button>
                )}
                <Button variant="primary" size="sm" icon={Settings} className="rounded-xl text-xs font-black" onClick={() => router.push('/settings')}>
                  Account settings
                </Button>
              </div>
              {student?.bio && <p className="text-xs lg:text-sm font-medium text-content-secondary leading-relaxed lg:text-right">{student.bio}</p>}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                  {socialLinks.map(([key, url]) => {
                    const { icon: Icon, color } = SOCIAL_ICONS[key];
                    return (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={`p-2.5 lg:p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* All India Rank */}
        <Card className="p-6 lg:p-10 space-y-6" radius="3xl">
          <div className="flex items-center gap-4">
            <Trophy className="w-7 h-7 lg:w-8 lg:h-8 text-primary-700" />
            <div>
              <h2 className="text-lg lg:text-2xl font-black font-outfit tracking-tight text-content-primary pb-1">All India Rank</h2>
              <p className="text-xs lg:text-sm font-medium text-content-secondary pb-1">Your rank among all active students.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:gap-6">
            <div className="rounded-[1.5rem] bg-primary-700 text-white p-4 lg:p-6 text-center">
              <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Exam AIR</p>
              <p className="text-2xl lg:text-4xl font-black font-outfit tracking-tight">{student?.examAIR ? `#${student.examAIR.rank}` : '—'}</p>
              <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">{student?.examAIR ? `of ${student.examAIR.total}` : 'No exams yet'}</p>
            </div>
            <div className="rounded-[1.5rem] bg-background-surface-secondary border border-slate-200 dark:border-slate-800 p-4 lg:p-6 text-center">
              <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-content-secondary mb-1">Quiz AIR</p>
              <p className="text-2xl lg:text-4xl font-black font-outfit tracking-tight text-content-primary">{student?.quizAIR ? `#${student.quizAIR.rank}` : '—'}</p>
              <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-content-secondary mt-1">{student?.quizAIR ? `of ${student.quizAIR.total}` : 'No quizzes yet'}</p>
            </div>
          </div>
        </Card>

        {/* Stats row — full width, theme-aware tiles */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {statTiles.map((item) => (
            <Card key={item.label} className="p-3 lg:p-5 text-center space-y-2" radius="2xl">
              <div className={`w-9 h-9 lg:w-11 lg:h-11 mx-auto rounded-xl lg:rounded-2xl flex items-center justify-center ${item.tone}`}>
                <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <p className="text-sm lg:text-xl font-black font-outfit tracking-tight text-content-primary">{item.value}</p>
              <p className="text-[8px] lg:text-[10px] font-bold uppercase tracking-wide text-content-secondary">{item.label}</p>
            </Card>
          ))}
        </div>

        {/* Sub-tab navigation */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 p-1.5 bg-background-surface-secondary dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-800/50 shadow-sm relative z-20 max-w-full">
          {[
            { id: 'profile', label: 'My Profile', icon: Award },
            { id: 'bank', label: 'Bank Details', icon: Wallet },
            { id: 'settings', label: 'Account Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg lg:rounded-xl font-black uppercase text-[10px] tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${activeSubTab === tab.id ? 'bg-primary-700 text-white shadow-sm scale-105' : 'text-content-secondary hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeSubTab === tab.id ? 'text-white' : 'text-primary-700'}`} />
              {tab.label}
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
              className="space-y-6"
            >
              {/* Profile completion */}
              {completion && !completion.isComplete && (
                <Card className="p-6 lg:p-10 space-y-6" radius="3xl">
                  <div className="flex items-center gap-4">
                    <Target className="w-7 h-7 lg:w-8 lg:h-8 text-primary-700" />
                    <div>
                      <h2 className="text-lg lg:text-2xl font-black font-outfit tracking-tight text-content-primary pb-1">Complete your profile</h2>
                      <p className="text-xs lg:text-sm font-medium text-content-secondary pb-1">A complete profile helps you stand out and unlocks rewards.</p>
                    </div>
                  </div>
                  <ProgressBar progress={completion.percentage} variant="primary" height="md" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {completion.fields.map((field) => (
                      <div key={field.field} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${field.completed ? 'text-primary-700' : 'text-slate-300 dark:text-slate-600'}`} />
                        <span className={`text-sm font-semibold ${field.completed ? 'text-content-primary' : 'text-content-secondary'}`}>{field.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Exam performance */}
              <Card className="p-6 lg:p-10 space-y-8" radius="3xl">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-7 h-7 lg:w-8 lg:h-8 text-primary-700" />
                  <div>
                    <h2 className="text-lg lg:text-2xl font-black font-outfit tracking-tight text-content-primary pb-1">Exam performance</h2>
                    <p className="text-xs lg:text-sm font-medium text-content-secondary pb-1">Preparing for {student?.primaryTargetExam || 'All Exams'}.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                  {[
                    { label: 'Overall readiness', value: `${student?.performanceMetrics?.examStats?.overallReadiness || 0}%` },
                    { label: 'Quizzes attempted', value: quizzesAttempted },
                    { label: 'Tests attempted', value: student?.performanceMetrics?.examStats?.mockTestsAttempted || 0 },
                    { label: 'Avg score', value: `${student?.performanceMetrics?.examStats?.averageMockScore || 0}%` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] bg-background-surface-secondary border border-slate-200 dark:border-slate-800 p-4 lg:p-5 text-center">
                      <p className="text-xl lg:text-2xl font-black font-outfit tracking-tight text-content-primary">{item.value}</p>
                      <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-content-secondary mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>

                {subjectAccuracy.length > 0 && (
                  <div className="space-y-2 lg:space-y-4">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-content-secondary">
                      <BookOpen className="w-4 h-4" /> Subject-wise accuracy
                    </p>
                    <div className="space-y-2 lg:space-y-4">
                      {subjectAccuracy.map(([subject, score]) => (
                        <ProgressBar key={subject} progress={score} variant="primary" height="sm" label={subject} />
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Badges */}
              <Card className="p-2 lg:p-4 space-y-6" radius="3xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Award className="w-7 h-7 lg:w-8 lg:h-8 text-primary-700" />
                    <div>
                      <h2 className="text-lg lg:text-xl font-black font-outfit tracking-tight text-content-primary pb-1">Badges</h2>
                      <p className="text-xs font-medium text-content-secondary pb-1">Earned through activity and achievements.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 lg:justify-end lg:flex-shrink-0">
                    {(student?.badges?.length ? student.badges : ['Student']).map((badge, index) => (
                      <span key={index} className="px-4 py-2.5 bg-background-surface-secondary text-content-primary rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200 dark:border-slate-800">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Account details */}
              <Card className="p-2 lg:p-4 space-y-6" radius="3xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary-700" />
                  <h3 className="font-outfit font-black tracking-tight text-lg text-content-primary pb-1">Account details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {accountDetails.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="p-2 bg-background-surface-secondary rounded-lg shadow-sm text-content-secondary flex-shrink-0">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-content-secondary">{item.label}</p>
                        <p className="text-sm font-semibold text-content-primary truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Referral code */}
              {student?.referralCode && (
                <Card className="p-2 lg:p-4 space-y-2 lg:space-y-4" radius="3xl">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary-700" />
                    <h3 className="font-outfit font-black tracking-tight text-lg text-content-primary pb-1">Your referral code</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 font-mono font-black text-lg tracking-[0.2em] bg-background-surface-secondary border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 select-all text-content-primary">
                      {student.referralCode}
                    </span>
                    <button onClick={copyReferralCode} className="p-3 bg-primary-700 hover:bg-primary-600 text-white rounded-xl transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-content-secondary leading-relaxed">{student.referralCount || 0} friends joined using your code.</p>
                </Card>
              )}

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
              <Card className="p-4 lg:p-10 space-y-2 lg:space-y-4 lg:space-y-8 relative overflow-hidden" radius="3xl">
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-black font-outfit tracking-tight text-content-primary pb-1">Payout details</h2>
                    <p className="text-sm font-medium text-content-secondary pb-1">Add your bank details to receive prize money.</p>
                  </div>
                  {bankDetails && <span className="px-4 py-1.5 rounded-full bg-primary-700 text-white text-xs font-semibold">Linked</span>}
                </div>

                {bankDetails ? (
                  <div className="p-4 lg:p-8 bg-background-surface-secondary text-content-primary rounded-[2rem] lg:rounded-[3rem] border border-slate-200 dark:border-slate-800 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="w-16 h-16 bg-primary-500/10 text-primary-700 rounded-[1.5rem] flex items-center justify-center border border-primary-500/20 flex-shrink-0">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl lg:text-2xl font-black font-outfit tracking-tight">{bankDetails.bankName}</h3>
                        <p className="text-sm font-medium text-content-secondary mt-1">
                          {bankDetails.accountHolderName || 'Account holder'} · Account ending {bankDetails.accountNumber?.slice(-4) || '----'}
                        </p>
                      </div>
                      <Button variant="primary" className="px-6 py-3 rounded-lg lg:rounded-xl text-sm font-semibold" onClick={() => router.push('/settings')}>
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 lg:p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] lg:rounded-[3rem] text-center space-y-5 relative z-10">
                    <div className="w-20 h-20 bg-background-surface-secondary rounded-full flex items-center justify-center mx-auto opacity-70">
                      <CreditCard className="w-10 h-10 text-content-secondary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl lg:text-2xl font-black font-outfit tracking-tight text-content-primary">No bank account linked</h3>
                      <p className="text-sm font-medium text-content-secondary max-w-md mx-auto">
                        Add your bank details to receive rewards without delays.
                      </p>
                    </div>
                    <Button variant="primary" className="px-10 py-4 rounded-2xl text-sm font-black" onClick={() => router.push('/settings')}>
                      Add bank details
                    </Button>
                  </div>
                )}

                <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
              </Card>
            </motion.div>
          )}

          {activeSubTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="p-8 space-y-6" radius="3xl">
                <div className="space-y-1">
                  <h2 className="text-xl lg:text-2xl font-black font-outfit tracking-tight text-content-primary pb-1">Quick actions</h2>
                  <p className="text-sm font-medium text-content-secondary pb-1">Jump to the places you are most likely to need next.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Manage subscription', onClick: () => router.push('/subscription') },
                    { label: 'Review account settings', onClick: () => router.push('/settings') },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-primary-500/30 transition-colors"
                    >
                      <span className="text-sm font-semibold text-content-primary">{item.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-8 space-y-2 lg:space-y-4" radius="3xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary-700" />
                  <h2 className="text-xl font-black font-outfit tracking-tight text-content-primary pb-1">Account safety</h2>
                </div>
                <p className="text-sm font-medium text-content-secondary leading-relaxed pb-1">
                  Keep your profile, bank details, and password up to date so your account stays secure and payouts go through smoothly.
                </p>
                <Button fullWidth onClick={secureLogout} icon={LogOut} className="py-4 text-sm font-black bg-primary-700 text-white shadow-sm rounded-2xl">
                  Log out
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
