'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import {
   Wallet,
   Trophy,
   Gift,
   History,
   ArrowUpRight,
   ShieldCheck,
   Zap,
   TrendingUp,
   Clock,
   CreditCard,
   Smartphone,
   CircleCheck,
   CircleAlert,
   HelpCircle,
   Sparkles,
   Target,
   BarChart3,
   MessageSquare,
   FileText,
   Users,
   IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../../lib/api';
import { getCurrentUser } from '../../../utils/authUtils';
import UnifiedFooter from '../../UnifiedFooter';
import Loading from '../../Loading';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const MIN_WITHDRAW_AMOUNT = parseInt(process.env.NEXT_PUBLIC_MIN_WITHDRAW_AMOUNT || '1000', 10);

const UserWallet = () => {
   const router = useRouter();
   const user = getCurrentUser();
   const [walletInfo, setWalletInfo] = useState({
      walletBalance: 0,
      claimableRewards: 0,
      referralRewards: [],
      referralCount: 0,
      isTopPerformer: false,
      rewardBreakdown: {
         quiz_reward: 0,
         blog_reward: 0,
         question_reward: 0,
         referral: 0,
         bonus: 0
      }
   });
   const [upi, setUpi] = useState('');
   const [loading, setLoading] = useState(false);
   const [walletLoading, setWalletLoading] = useState(true);
   const [isClaiming, setIsClaiming] = useState(false);
   const [focusedField, setFocusedField] = useState(null);
   const fetchRef = useRef(false);

   const load = useCallback(async () => {
      setWalletLoading(true);
      try {
         const res = await API.getWalletData();
         if (res?.success && res.data) {
            const data = res.data;
            setWalletInfo({
               walletBalance: data.walletBalance || 0,
               claimableRewards: data.claimableRewards || 0,
               referralRewards: data.referralRewards || [],
               referralCount: data.referralCount || 0,
               isTopPerformer: data.isTopPerformer || false,
               subscriptionStatus: data.subscriptionStatus || 'free',
               rewardBreakdown: data.rewardBreakdown || {
                  quiz_reward: 0,
                  blog_reward: 0,
                  question_reward: 0,
                  referral: 0,
                  bonus: 0
               }
            });
         }
      } catch (e) {
         console.error('Wallet sync offline', e);
         toast.error('Sector data inaccessible');
      } finally {
         setWalletLoading(false);
      }
   }, []);

   useEffect(() => {
      if (user && !fetchRef.current) {
         fetchRef.current = true;
         load();
      }
   }, [load, !!user]);

   const handleClaimRewards = async (e) => {
      if (e) e.preventDefault();
      if (walletInfo.claimableRewards <= 0) return toast.error("No bounty to claim!");
      if (!walletInfo.isTopPerformer) return toast.error("Claiming requires Top Performer status!");

      try {
         setIsClaiming(true);
         const res = await API.claimRewards();
         if (res.success) {
            toast.success('Bounty Synthesized Successfully!');
            setWalletInfo(prev => ({
               ...prev,
               walletBalance: res.data.walletBalance,
               claimableRewards: res.data.claimableRewards
            }));
         }
      } catch (err) {
         toast.error("Claim sequence interrupted.");
      } finally {
         setIsClaiming(false);
      }
   };

   const submitWithdraw = async (e) => {
      e.preventDefault();
      const withdrawAmount = walletInfo.walletBalance;

      if (withdrawAmount <= 0) return toast.error('Vault balance at zero');
      if (withdrawAmount < MIN_WITHDRAW_AMOUNT) return toast.error(`Min withdrawal is ₹${MIN_WITHDRAW_AMOUNT}`);
      if (!upi) return toast.error('UPI Authentication Required');

      setLoading(true);
      try {
         const res = await API.createReferralWithdrawRequest({ amount: withdrawAmount, upi });
         if (res?.success) {
            toast.success('Withdrawal Request Transmitted! ðŸ’°');
            setUpi('');
            load();
         }
      } catch (err) {
         toast.error('Withdrawal protocol failed.');
      } finally {
         setLoading(false);
      }
   };

   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
         style: 'currency',
         currency: 'INR',
         minimumFractionDigits: 0
      }).format(amount);
   };

   const canWithdraw = walletInfo.walletBalance >= MIN_WITHDRAW_AMOUNT && walletInfo.isTopPerformer;

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white font-outfit">

         <div className="container mx-auto px-2 lg:px-6 py-4 lg:py-12 space-y-8 lg:space-y-16">

            {/* --- Vault Hero Section --- */}
            <header className="relative py-4 lg:py-6 text-center space-y-3 lg:space-y-8 bg-white dark:bg-slate-800/50 rounded-[2rem] lg:rounded-[3rem] shadow-duo-primary border-4 border-white dark:border-slate-800 backdrop-blur-xl">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-28 h-28 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-duo-primary relative border-4 border-white dark:border-slate-800"
               >
                  <Wallet className="w-14 h-14" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm">
                     <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
               </motion.div>
               <div className="space-y-4">
                  <h1 className="text-xl lg:text-5xl font-black uppercase tracking-tighter leading-none">
                     Alpha <span className="text-primary-700 dark:text-primary-500">Vault</span>
                  </h1>
                  <p className="text-xs font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] max-w-2xl mx-auto">
                     Secure Asset Extraction & Credit Creation Node
                  </p>
               </div>

               {/* Decorative Level HUD */}
               <div className="absolute top-8 right-8 hidden lg:flex items-center gap-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl border-l-4 border-primary-500">
                  <div className="text-right">
                     <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">CREDIT CLEARANCE</p>
                     <p className="text-sm font-black uppercase tracking-tight">{walletInfo.subscriptionStatus === 'pro' ? 'LEVEL: ELITE' : 'LEVEL: APPRENTICE'}</p>
                  </div>
                  <Zap className={`w-6 h-6 ${walletInfo.subscriptionStatus === 'pro' ? 'text-primary-700 dark:text-primary-500' : 'text-slate-700 dark:text-slate-400'}`} />
               </div>
            </header>

            {/* --- Main Balances Matrix --- */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Withdrawable Balance Card */}
               <Card className="p-6 lg:p-12 group relative overflow-hidden flex flex-col justify-between border-none bg-white dark:bg-slate-800 shadow-duo-emerald rounded-[2rem] lg:rounded-[3rem]">
                  <div className="space-y-6 lg:space-y-10 relative z-10">
                     <div className="flex justify-between items-start">
                        <div className="p-5 bg-emerald-500/10 text-emerald-500 rounded-3xl shadow-sm border-2 border-emerald-500/20">
                           <CreditCard className="w-10 h-10" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className="px-5 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-duo-secondary">EXTRACTABLE</span>
                           <div className="flex items-center gap-2 text-emerald-500">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-widest">LIVE UPLINK</span>
                           </div>
                        </div>
                     </div>
                     <div>
                        <p className="text-[12px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] leading-none mb-3">Primary Vault Capital</p>
                        <h3 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter text-emerald-500">
                           {walletLoading ? '---' : formatCurrency(walletInfo.walletBalance)}
                        </h3>
                     </div>
                     <div className="flex items-center gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <div className={`p-2 rounded-lg ${walletInfo.walletBalance >= MIN_WITHDRAW_AMOUNT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                           {walletInfo.walletBalance >= MIN_WITHDRAW_AMOUNT ? <CircleCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">THRESHOLD PROTOCOL</p>
                           <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">MIN EXTRACTION: <span className="flex items-center gap-1 inline-flex"><IndianRupee className="w-3 h-3" />{MIN_WITHDRAW_AMOUNT}</span></p>
                        </div>
                     </div>
                  </div>
                  <Sparkles className="absolute -bottom-10 -right-10 w-64 h-64 text-emerald-500/5 group-hover:text-emerald-500/10 transition-transform duration-700 group-hover:rotate-12" />
               </Card>

               {/* Claimable Bounty Card */}
               <Card className="p-6 lg:p-12 group relative overflow-hidden flex flex-col justify-between border-none bg-white dark:bg-slate-800 shadow-duo-primary rounded-[2rem] lg:rounded-[3rem]">
                  <div className="space-y-6 lg:space-y-10 relative z-10">
                     <div className="flex justify-between items-start">
                        <div className="p-5 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-3xl shadow-sm border-2 border-primary-500/20">
                           <Trophy className="w-10 h-10" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className="px-5 py-2 bg-primary-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-duo-primary">BOUNTY</span>
                           {walletInfo.isTopPerformer && (
                              <div className="flex items-center gap-2 text-primary-700 dark:text-primary-500">
                                 <TrendingUp className="w-4 h-4 animate-bounce" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">RANK VERIFIED</span>
                              </div>
                           )}
                        </div>
                     </div>
                     <div>
                        <p className="text-[12px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] leading-none mb-3">Unclaimed Intel Assets</p>
                        <h3 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter text-primary-700 dark:text-primary-500">
                           {walletLoading ? '---' : formatCurrency(walletInfo.claimableRewards)}
                        </h3>
                     </div>
                     <div className="flex flex-wrap gap-4">
                        <Button
                           variant="primary"
                           disabled={isClaiming || walletInfo.claimableRewards <= 0 || !walletInfo.isTopPerformer}
                           onClick={handleClaimRewards}
                           className="rounded-2xl px-12 py-6 text-sm font-black shadow-duo-primary transform active:scale-95 transition-all group-hover:shadow-xl"
                        >
                           {isClaiming ? 'SYNTHESIZING...' : (walletInfo.isTopPerformer ? 'SYNTHESIZE BOUNTY' : 'LOCKED: STATUS PENDING')}
                        </Button>
                        {!walletInfo.isTopPerformer && (
                           <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center gap-3 border-l-4 border-primary-500">
                              <CircleAlert className="w-5 h-5 text-primary-700 dark:text-primary-500" />
                              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                                 Access Denied:<br /><span className="text-slate-600 dark:text-slate-400">Requires Top Performer Node</span>
                              </p>
                           </div>
                        )}
                     </div>
                  </div>
                  <Zap className="absolute -bottom-10 -right-10 w-64 h-64 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-transform duration-700 group-hover:-rotate-12" />
               </Card>
            </section>

            {/* --- Earnings Architecture --- */}
            <section className="space-y-6 lg:space-y-10 pt-6 lg:pt-10">
               <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-6 px-2 lg:px-4">
                  <div className="space-y-2 lg:space-y-4">
                     <h2 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter">Asset <span className="text-primary-700 dark:text-primary-500">Distribution</span></h2>
                     <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] leading-none">Resource allocation across high-frequency sectors</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                     <Target className="w-4 h-4 text-emerald-500" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Total Alliances: <span className="text-slate-900 dark:text-white">{walletInfo.referralCount}</span></p>
                  </div>
               </div>

               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                  {[
                     { label: 'Quiz Command', val: walletInfo.rewardBreakdown?.quiz_reward || 0, icon: Target, color: 'primary' },
                     { label: 'Intel Design', val: walletInfo.rewardBreakdown?.question_reward || 0, icon: MessageSquare, color: 'secondary' },
                     { label: 'Codex Articles', val: walletInfo.rewardBreakdown?.blog_reward || 0, icon: FileText, color: 'emerald' },
                     { label: 'Alliance Multi', val: (walletInfo.rewardBreakdown?.bonus || 0) + (walletInfo.rewardBreakdown?.referral || 0), icon: BarChart3, color: 'amber' }
                  ].map((s, i) => (
                     <motion.div key={i} whileHover={{ y: -8 }} className="group">
                        <Card className="p-5 lg:p-8 border-none bg-white dark:bg-slate-800 shadow-sm hover:shadow-duo-primary transition-all rounded-[2rem] lg:rounded-[2.5rem]">
                           <div className="space-y-6">
                              <div className={`w-14 h-14 bg-${s.color === 'primary' ? 'primary' : s.color === 'secondary' ? 'secondary' : s.color === 'emerald' ? 'emerald' : 'amber'}-500/10 text-${s.color === 'primary' ? 'primary' : s.color === 'secondary' ? 'secondary' : s.color === 'emerald' ? 'emerald' : 'amber'}-500 rounded-2xl flex items-center justify-center shadow-inner`}>
                                 <s.icon className="w-7 h-7" />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-2">{s.label}</p>
                                 <p className="text-xl lg:text-3xl font-black uppercase tracking-tight group-hover:text-primary-700 dark:text-primary-500 transition-colors">{formatCurrency(s.val)}</p>
                              </div>
                           </div>
                        </Card>
                     </motion.div>
                  ))}
               </div>
            </section>

            {/* --- Transmission Hub (Nav) --- */}
            <section className="flex flex-wrap justify-center gap-6 pt-10">
               {[
                  { label: 'ALLIANCE LOGS', path: '/referral-history', icon: Smartphone },
                  { label: 'MISSION BOUNTY', path: '/pro/user-quiz-rewards', icon: Target },
                  { label: 'INTEL ARCHIVE', path: '/pro/question-rewards-history', icon: HelpCircle },
                  { label: 'CODEX ASSETS', path: '/pro/blog-rewards-history', icon: FileText },
                  { label: 'EXTRACTION HISTORY', path: '/pro/withdrawal-history', icon: History }
               ].map((btn, i) => (
                  <Button
                     key={i}
                     variant="ghost"
                     onClick={() => router.push(btn.path)}
                     className="px-8 py-6 rounded-2xl bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary-700 dark:text-primary-500 hover:border-primary-500/20 transition-all shadow-sm active:scale-95"
                  >
                     <btn.icon className="w-5 h-5 mr-3" /> {btn.label}
                  </Button>
               ))}
            </section>

            {/* --- Extraction Protocol (Withdrawal) --- */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-16 border-t-4 border-slate-100 dark:border-slate-800">
               <div className="space-y-10">
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-primary-500/20">
                           <Zap className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter">Extraction <span className="text-primary-700 dark:text-primary-500">Protocol</span></h2>
                     </div>

                     <div className="p-8 bg-slate-900 text-white rounded-[3rem] space-y-6 shadow-2xl border-l-[12px] border-primary-500 relative overflow-hidden">
                        <div className="flex items-center gap-4 text-primary-700 dark:text-primary-500 relative z-10">
                           <ShieldCheck className="w-8 h-8" />
                           <h3 className="font-black uppercase tracking-[0.3em] text-sm">Security Handshake Required</h3>
                        </div>
                        <ul className="space-y-5 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] relative z-10">
                           <li className="flex items-center gap-4">
                              <div className="w-2.5 h-2.5 bg-primary-500 rounded-full shadow-[0_0_10px_#f59e0b]" />
                              <span className="flex items-center gap-1">VAULT MINIMUM: <IndianRupee className="w-2.5 h-2.5" />{MIN_WITHDRAW_AMOUNT}</span>
                           </li>
                           <li className="flex items-center gap-4">
                              <div className="w-2.5 h-2.5 bg-primary-500 rounded-full shadow-[0_0_10px_#f59e0b]" />
                              <span>Status: ELITE (MONTHLY TOP PERFORMER)</span>
                           </li>
                           <li className="flex items-center gap-4">
                              <div className="w-2.5 h-2.5 bg-primary-500 rounded-full shadow-[0_0_10px_#f59e0b]" />
                              <span>UPI Creation KEY AUTHENTICATION</span>
                           </li>
                        </ul>
                        <ArrowUpRight className="absolute -bottom-8 -right-8 w-40 h-40 text-white/5" />
                     </div>
                  </div>

                  <div className={`p-10 rounded-[3rem] border-4 transition-all duration-500 ${walletInfo.isTopPerformer ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 shadow-duo-emerald' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 shadow-inner'}`}>
                     <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-4 transition-all ${walletInfo.isTopPerformer ? 'bg-emerald-500/10 border-emerald-500/20 shadow-sm' : 'bg-slate-200 dark:bg-slate-700 border-transparent'}`}>
                           <ShieldCheck className={`w-10 h-10 ${walletInfo.isTopPerformer ? 'text-emerald-500 animate-pulse' : 'text-slate-600 dark:text-slate-400 opacity-50'}`} />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[11px] font-black uppercase tracking-[0.4em] leading-none mb-1 opacity-60">Status Scan</p>
                           <p className="text-xl lg:text-2xl font-black uppercase tracking-tight">
                              {walletInfo.isTopPerformer ? 'Protocol Clearance: APPROVED' : 'Access Denied: RANK INSUFFICIENT'}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               <Card className="p-12 bg-white dark:bg-slate-800/80 backdrop-blur-3xl border-none shadow-duo-secondary rounded-[4rem]">
                  {!canWithdraw ? (
                     <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-10">
                        <div className="w-28 h-28 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                           <Zap className="w-14 h-14 text-slate-300 dark:text-slate-600" />
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-xl lg:text-3xl font-black uppercase tracking-tighter">Extraction Locked</h3>
                           <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] leading-loose max-w-xs mx-auto">
                              Balance <span className="inline-flex items-center gap-0.5"><IndianRupee className="w-2.5 h-2.5" />{walletInfo.walletBalance}</span> / <span className="text-primary-700 dark:text-primary-500 inline-flex items-center gap-0.5"><IndianRupee className="w-2.5 h-2.5" />{MIN_WITHDRAW_AMOUNT} Required</span><br />
                              Monthly Top Performer Node Inactive
                           </p>
                        </div>
                        <div className="w-full flex items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl opacity-50 border-2 border-slate-100 dark:border-slate-800">
                           <ShieldCheck className="w-6 h-6" />
                           <p className="text-xs font-black uppercase tracking-widest">HANDSHAKE PENDING</p>
                        </div>
                     </div>
                  ) : (
                     <form onSubmit={submitWithdraw} className="space-y-10">
                        <div className="space-y-4">
                           <label className="text-[12px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.5em] ml-4 leading-none">EXTRACTION QUANTITY</label>
                           <div className="relative group">
                              <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center text-4xl font-black text-emerald-500 drop-shadow-sm"><IndianRupee className="w-8 h-8" /></div>
                              <div className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 pl-20 text-5xl font-black text-slate-900 dark:text-white shadow-inner group-hover:border-emerald-500/20 transition-all">
                                 {walletInfo.walletBalance.toLocaleString()}
                              </div>
                              <div className="absolute top-1/2 -translate-y-1/2 right-10 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">FULL MAX</div>
                           </div>
                           <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] ml-6 opacity-60 flex items-center gap-2">
                              <Zap className="w-3 h-3" /> FULL VAULT EXTRACTION PROTOCOL ENGAGED
                           </p>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[12px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.5em] ml-4 leading-none">UPI Creation ID</label>
                           <div className="relative group">
                              <Smartphone className={`absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 transition-all duration-300 ${focusedField === 'upi' ? 'text-primary-700 dark:text-primary-500 scale-110' : 'text-slate-300'}`} />
                              <input
                                 type="text"
                                 className={`w-full bg-slate-50 dark:bg-slate-900 border-4 rounded-[2.5rem] p-10 pl-20 text-xl font-black placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none transition-all duration-300 ${focusedField === 'upi' ? 'border-primary-500 ring-8 ring-primary-500/10 shadow-lg' : 'border-slate-100 dark:border-slate-800 shadow-inner'}`}
                                 placeholder="Enter UPI ID (e.g. name@bank)"
                                 value={upi}
                                 onChange={e => setUpi(e.target.value)}
                                 onFocus={() => setFocusedField('upi')}
                                 onBlur={() => setFocusedField(null)}
                              />
                           </div>
                        </div>

                        <Button
                           type="submit"
                           disabled={loading || !upi}
                           variant="secondary"
                           fullWidth
                           className="py-10 text-lg font-black shadow-duo-secondary rounded-[2.5rem] transform active:scale-95 transition-all hover:shadow-[0_20px_40px_rgba(245,158,11,0.3)]"
                        >
                           {loading ? (
                              <div className="flex items-center justify-center gap-4">
                                 <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                 TRANSMITTING ASSETS...
                              </div>
                           ) : (
                              <div className="flex items-center justify-center gap-4">
                                 <Zap className="w-7 h-7" /> INITIATE EXTRACTION
                              </div>
                           )}
                        </Button>
                     </form>
                  )}
               </Card>
            </section>

         </div>

         <UnifiedFooter />
      </div>
   );
};

export default UserWallet;


