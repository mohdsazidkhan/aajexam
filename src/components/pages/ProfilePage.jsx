'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowRight,
  Building2,
  Clock,
  CreditCard,
  Flame,
  LogOut,
  Mail,
  Phone,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  User,
  Wallet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import { handleAuthError } from '../../lib/utils/authUtils';
import { useRewards } from '../../hooks/useRewards';
import Loading from '../Loading';
import Button from '../ui/Button';
import Card from '../ui/Card';
import UnifiedFooter from '../UnifiedFooter';

const formatCurrency = (value) => `Rs.${Number(value || 0).toLocaleString('en-IN')}`;

const ProfilePage = () => {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile', 'bank', 'settings'
  const { rewards: rewardsData } = useRewards();

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

  const levelInfo = student?.levelInfo?.currentLevel || { name: 'Starter', number: 1, description: 'Start practicing to unlock your next level.' };
  const monthlyProgress = student?.monthlyProgress || {};
  const quickStats = useMemo(
    () => [
      {
        label: 'Current streak',
        value: `${student?.streak || 0} days`,
        icon: Flame,
        tone: 'bg-orange-500/10 text-orange-500',
      },
      {
        label: 'Wallet balance',
        value: formatCurrency(student?.walletBalance || 0),
        icon: Wallet,
        tone: 'bg-emerald-500/10 text-emerald-500',
      },
      {
        label: 'Rewards to claim',
        value: formatCurrency(rewardsData?.claimableRewards || student?.claimableRewards || 0),
        icon: Trophy,
        tone: 'bg-primary-500/10 text-primary-600',
      },
      {
        label: 'Referrals',
        value: student?.referralCount || 0,
        icon: User,
        tone: 'bg-primary-500/10 text-primary-700 dark:text-primary-500',
      },
    ],
    [rewardsData?.claimableRewards, student?.claimableRewards, student?.referralCount, student?.streak, student?.walletBalance]
  );

  const performanceStats = [
    { label: 'High-score quizzes this month', value: monthlyProgress?.highScoreWins || 0 },
    { label: 'Total quizzes tried', value: monthlyProgress?.totalQuizAttempts || 0 },
    { label: 'Accuracy', value: `${monthlyProgress?.accuracy || 0}%` },
  ];

  const accountDetails = [
    { label: 'Email', value: student?.email || 'Not added', icon: Mail },
    { label: 'Phone', value: student?.phone || 'Not added', icon: Phone },
    { label: 'Membership', value: student?.subscriptionStatus === 'pro' ? 'PRO' : 'FREE', icon: ShieldCheck },
    {
      label: 'Joined',
      value: student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Unknown',
      icon: Clock,
    },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background-page"><Loading size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-background-page animate-fade-in pb-24 selection:bg-primary-500 selection:text-white">
      <Head>
        <title>My Profile | {student?.name || 'Student'}</title>
      </Head>

      <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 space-y-5 lg:space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
          <Card className="lg:col-span-8 p-5 lg:p-10 relative overflow-hidden border-none shadow-2xl rounded-[2rem] lg:rounded-[4rem] bg-background-surface">
            <div className="flex flex-col lg:flex-row items-center gap-5 lg:gap-10 relative z-10">
              <div className="flex-1 space-y-4 lg:space-y-6 text-center lg:text-left">
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    <h1 className="text-2xl lg:text-5xl font-black font-outfit tracking-tight leading-none text-content-primary">
                      {student?.name || 'Student'}
                    </h1>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${student?.subscriptionStatus === 'pro' ? 'bg-amber-500 text-white shadow-duo-amber' : 'bg-slate-100 dark:bg-slate-700 text-content-secondary'}`}>
                      {student?.subscriptionStatus === 'pro' ? 'PRO' : 'Free plan'}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-content-secondary">
                    @{student?.username || 'guest'}
                  </p>
                  <p className="text-base font-medium text-content-secondary max-w-2xl">
                    Level {levelInfo.number} - {levelInfo.name}. {levelInfo.description || 'Keep practicing to unlock more levels and win rewards.'}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <Button variant="primary" size="lg" className="px-8 py-4 rounded-2xl text-sm font-black shadow-duo-primary" onClick={() => router.push('/edit-profile')}>
                    Edit profile
                  </Button>
                  <Button variant="ghost" size="lg" icon={Settings} className="px-8 py-4 rounded-2xl border-2 border-border-primary text-sm font-semibold bg-background-surface" onClick={() => router.push('/settings')}>
                    Account settings
                  </Button>
                </div>
              </div>
            </div>

            <Sparkles className="absolute -top-8 -right-8 w-24 lg:w-48 h-24 lg:h-48 text-primary-600/10 pointer-events-none" />
          </Card>

          <Card className="lg:col-span-4 bg-slate-900 border-none shadow-2xl p-5 lg:p-8 text-white rounded-[2rem] lg:rounded-[4rem] overflow-hidden relative">
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary-300">Current level</p>
                <h2 className="text-4xl font-black font-outfit tracking-tight">
                  {levelInfo.name} <span className="text-primary-400">Lv. {levelInfo.number}</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {performanceStats.map((item) => (
                  <div key={item.label} className="rounded-[2rem] bg-white/5 border border-white/10 p-5">
                    <p className="text-sm font-medium text-slate-300">{item.label}</p>
                    <p className="text-xl lg:text-2xl font-black font-outfit tracking-tight mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Trophy className="absolute -bottom-8 -right-8 w-40 h-40 text-white/5" />
          </Card>
        </section>

        {/* --- Sub-Tab Navigation (Mobile-First) --- */}
        <section className="px-4 lg:px-0 !mt-0">
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 p-1.5 bg-background-surface-secondary dark:bg-slate-800/50 rounded-2xl w-fit mx-auto lg:mx-0 border border-border-primary/50 shadow-sm relative z-20 max-w-full">
            {[
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'bank', label: 'Bank Details', icon: Wallet },
              { id: 'settings', label: 'Account Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${activeSubTab === tab.id ? 'bg-primary-500 text-white shadow-duo-primary scale-105' : 'text-content-secondary hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${activeSubTab === tab.id ? 'text-white' : 'text-primary-500'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <AnimatePresence mode="wait">
          {activeSubTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-6">
                {quickStats.map((item) => (
                  <Card key={item.label} className="p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] shadow-xl bg-background-surface border-b-8 border-border-primary">
                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center ${item.tone}`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-1 mt-5">
                      <p className="text-sm font-medium text-content-secondary">{item.label}</p>
                      <h3 className="text-xl lg:text-3xl font-black font-outfit tracking-tight text-content-primary">{item.value}</h3>
                    </div>
                  </Card>
                ))}
              </section>

              <Card className="p-10 bg-background-surface shadow-xl rounded-[3rem] space-y-8">
                <div className="flex items-center gap-4">
                  <Target className="w-8 h-8 text-primary-600" />
                  <div>
                    <h2 className="text-xl lg:text-2xl font-black font-outfit tracking-tight">Account details</h2>
                    <p className="text-sm font-medium text-content-secondary">Your saved account details and plan information.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {accountDetails.map((item) => (
                    <div key={item.label} className="flex items-center gap-4 p-5 bg-background-page rounded-[2rem] border border-border-primary">
                      <div className="p-3 bg-background-surface rounded-2xl shadow-sm text-content-secondary">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-content-secondary">{item.label}</p>
                        <p className="text-base font-semibold text-content-primary">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
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
              <Card className="p-4 lg:p-10 bg-background-surface shadow-xl rounded-[3rem] space-y-4 lg:space-y-8 relative overflow-hidden">
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-black font-outfit tracking-tight">Payout details</h2>
                    <p className="text-sm font-medium text-content-secondary">Add your bank details to receive prize money.</p>
                  </div>
                  {bankDetails && <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold">Linked</span>}
                </div>

                {bankDetails ? (
                  <div className="p-4 lg:p-8 bg-slate-900 text-white rounded-[2rem] lg:rounded-[3rem] border border-slate-800 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl lg:text-2xl font-black font-outfit tracking-tight">{bankDetails.bankName}</h3>
                        <p className="text-sm font-medium text-slate-300 mt-1">
                          {bankDetails.accountHolderName || 'Account holder'} Ã‚Â· Account ending {bankDetails.accountNumber?.slice(-4) || '----'}
                        </p>
                      </div>
                      <Button variant="ghost" className="px-6 py-3 rounded-xl border border-slate-700 text-sm font-semibold text-white hover:text-primary-400" onClick={() => router.push('/settings')}>
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 lg:p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] lg:rounded-[3rem] text-center space-y-5 bg-background-page relative z-10">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-70">
                      <CreditCard className="w-10 h-10 text-content-secondary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl lg:text-2xl font-black font-outfit tracking-tight">No bank account linked</h3>
                      <p className="text-sm font-medium text-content-secondary max-w-md mx-auto">
                        Add your bank details to receive rewards without delays.
                      </p>
                    </div>
                    <Button variant="secondary" className="px-10 py-4 rounded-2xl text-sm font-black shadow-duo-secondary" onClick={() => router.push('/settings')}>
                      Add bank details
                    </Button>
                  </div>
                )}

                <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <Card className="p-8 bg-background-surface shadow-xl rounded-[3rem] space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl lg:text-2xl font-black font-outfit tracking-tight">Quick actions</h2>
                  <p className="text-sm font-medium text-content-secondary">Jump to the places you are most likely to need next.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Open rewards', onClick: () => router.push('/rewards') },
                    { label: 'Manage subscription', onClick: () => router.push('/subscription') },
                    { label: 'Review account settings', onClick: () => router.push('/settings') },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-background-page border border-border-primary text-left hover:border-primary-500/30 transition-colors"
                    >
                      <span className="text-sm font-semibold text-content-primary">{item.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-8 bg-slate-900 text-white shadow-xl rounded-[3rem] space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary-400" />
                  <h2 className="text-xl font-black font-outfit tracking-tight">Account safety</h2>
                </div>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  Keep your profile, bank details, and password up to date so your account stays secure and payouts go through smoothly.
                </p>
                <Button fullWidth onClick={secureLogout} icon={LogOut} className="py-4 text-sm font-black bg-red-500 text-white shadow-duo-red rounded-2xl">
                  Log out
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UnifiedFooter />
    </div>
  );
};

export default ProfilePage;


