'use client';

import React, { useEffect, useState, useCallback } from "react";
import {
   Users,
   Wallet,
   Trophy,
   UserPlus,
   History,
   Copy,
   CircleCheck,
   Clock,
   TrendingUp,
   Zap,
   ShieldCheck,
   ChevronRight,
   ArrowRight,
   Gift,
   Coins,
   ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import { ListSkeleton } from "../skeletons/PrivateSkeletons";
import { useSSR } from '../../hooks/useSSR';
import Card from '../ui/Card';
import Button from '../ui/Button';
import UnifiedFooter from '../UnifiedFooter';

const PAGE_LIMIT = 20;

export default function ReferralHistory() {
   const { isMounted, router } = useSSR();

   const [user, setUser] = useState(null);
   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [page, setPage] = useState(1);
   const [pagination, setPagination] = useState({});

   const fetchReferralHistory = useCallback(async (pageNum = 1) => {
      try {
         setLoading(true);
         const params = { page: pageNum, limit: PAGE_LIMIT };
         const response = await API.getReferralHistory(params);

         if (response?.success) {
            setUser(response.data?.user || null);
            setTransactions(response.data?.transactions || []);
            setPagination(response.data?.pagination || {});
         } else {
            setError(response?.message || 'Failed to load referral data');
         }
      } catch (err) {
         setError(err.message || 'Connection lost. Please try again.');
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      if (isMounted) fetchReferralHistory(page);
   }, [isMounted, page, fetchReferralHistory]);

   const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      toast.success('Referral link copied!');
   };

   if (!isMounted) return null;

   const rewardLabels = {
      'plan99': '₹99 PLAN ACTIVATED',
   };

   const rewardColors = {
      'plan99': 'emerald',
   };

   return (
      <div className="min-h-screen animate-fade-in selection:bg-primary-700 selection:text-white">

         <div className="container mx-auto mt-0 space-y-2 lg:space-y-4 lg:space-y-8">

            {/* --- Header Section --- */}
            <section className="relative px-0 py-4 lg:py-8">
               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">

                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-6 text-center lg:text-left">
                     <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 bg-primary-500/10 text-primary-700 rounded-[2rem] flex items-center justify-center shrink-0 shadow-sm border-2 border-primary-500/10">
                        <Users className="w-10 h-10" />
                     </motion.div>
                     <div className="space-y-2 lg:space-y-4">
                        <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Referral <span className="text-primary-700">History</span></h1>
                        <p className="text-sm font-bold text-content-secondary uppercase tracking-[0.3em] max-w-2xl mx-auto lg:mx-0">Share your link with friends. When they buy the PRO plan (first time), you earn ₹33.</p>
                     </div>
                  </div>

                  {/* Referral Link Card */}
                  {user && (
                     <Card className="w-full lg:w-auto lg:min-w-[360px] bg-background-surface/80 backdrop-blur-xl border-none shadow-sm rounded-[2.5rem]">
                        <div className="p-2 space-y-3 text-left">
                           <p className="text-xs font-black text-content-secondary uppercase tracking-widest leading-none">Your Invite Code</p>
                           <div className="flex items-center gap-3">
                              <p className="flex-1 text-lg font-bold font-mono tracking-wider truncate text-primary-700">{user.referralCode}</p>
                              <Button variant="primary" size="lg" className="rounded-full px-8 py-4 text-xs font-black shadow-sm shrink-0" onClick={() => copyToClipboard(`https://aajexam.com/register?ref=${user.referralCode}`)}>
                                 <Copy className="w-4 h-4 mx-auto" /> COPY LINK
                              </Button>
                           </div>
                        </div>
                     </Card>
                  )}
               </div>
            </section>

            {/* --- Stats Grid --- */}
            {user && (
               <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {[
                     { label: 'Money You Earned', val: `₹${(user.referralRewards?.reduce((s, r) => s + (r.amount || 0), 0) || 0).toLocaleString()}`, icon: Wallet, color: 'primary' },
                     { label: 'Friends Referred', val: user.referralCount || 0, icon: UserPlus, color: 'primary' },
                     { label: 'Times Rewarded', val: user.referralRewards?.length || 0, icon: Gift, color: 'primary' },
                     { label: 'Who Referred You', val: user.referredBy || 'Direct', icon: ShieldCheck, color: 'primary' }
                  ].map((s, i) => (
                     <Card key={i} className="group hover:scale-[1.02] transition-transform border-b-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-[2rem] lg:rounded-[2.5rem]">
                        <div className="flex justify-between items-start mb-4 lg:mb-6">
                           <div className={`p-4 bg-${s.color === 'primary' ? 'primary' : s.color === 'secondary' ? 'secondary' : s.color}-500/10 text-${s.color === 'primary' ? 'primary' : s.color === 'secondary' ? 'secondary' : s.color}-500 rounded-2xl`}>
                              <s.icon className="w-6 h-6" />
                           </div>
                           <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-content-secondary transition-colors" />
                        </div>
                        <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight">{s.val}</p>
                     </Card>
                  ))}
               </section>
            )}

            {/* --- Main Content Area --- */}
            <div className="flex flex-col gap-12">

               {/* Left Sidebar: Breakdown */}
               <div className="space-y-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
                     <div className="space-y-2">
                        <h2 className="text-xl font-black font-outfit uppercase tracking-tight">How You <span className="text-primary-700">Earned</span></h2>
                        <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest">See which type of referral gave you how much money</p>
                     </div>

                     <div className="w-full lg:w-auto lg:min-w-[320px] space-y-2 lg:space-y-4">
                        {[
                           { label: 'Friend Buys ₹99 Plan', type: 'plan99', color: 'primary' }
                        ].map((b, i) => {
                           const amount = user?.referralRewards?.filter(r => r.type === b.type).reduce((s, r) => s + (r.amount || 0), 0) || 0;
                           const count = user?.referralRewards?.filter(r => r.type === b.type).length || 0;
                           return (
                              <Card key={i} className="relative overflow-hidden group rounded-2xl">
                                 <div className="flex justify-between items-center relative z-10">
                                    <div className="space-y-1">
                                       <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest leading-none">{b.label}</p>
                                       <p className="text-xl font-black font-outfit text-content-primary uppercase">₹{amount.toLocaleString()}</p>
                                    </div>
                                    <div className={`text-[10px] font-black px-3 py-1 rounded-full bg-${b.color}-500/10 text-${b.color}-500 border border-${b.color}-500/20`}>
                                       {count} FRIENDS
                                    </div>
                                 </div>
                                 <div className={`absolute top-0 right-0 w-1.5 h-full bg-${b.color}-500`} />
                              </Card>
                           );
                        })}
                     </div>
                  </div>
               </div>

               {/* Right Area: Friend List */}
               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="space-y-2">
                        <h2 className="text-xl font-black font-outfit uppercase tracking-tight">Referral <span className="text-primary-700">Logs</span></h2>
                        <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest">Students who signed up using your referral link</p>
                     </div>
                     <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                        <History className="w-5 h-5 text-content-secondary" />
                     </div>
                  </div>

                  <AnimatePresence mode="wait">
                     {loading ? (
                        <ListSkeleton rows={6} />
                     ) : transactions.length === 0 ? (
                        <Card className="py-4 lg:py-8 text-center space-y-3 lg:space-y-6 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent rounded-[4rem]">
                           <Users className="w-16 h-16 text-slate-200 mx-auto" />
                           <div className="space-y-2">
                              <h3 className="text-xl font-black font-outfit uppercase tracking-tight">No Referrals Yet</h3>
                              <p className="text-xs font-bold text-content-secondary uppercase tracking-widest">You have not referred anyone yet. Share your link and start earning.</p>
                           </div>
                           <Button variant="primary" className="rounded-full mx-auto px-8 py-3 text-[10px] font-black uppercase tracking-widest" onClick={() => copyToClipboard(`https://aajexam.com/register?ref=${user.referralCode}`)}>
                              COPY LINK
                           </Button>
                        </Card>
                     ) : (
                        <div className="space-y-2 lg:space-y-4">
                           <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-800/80 rounded-[3rem]">
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                       <tr>
                                          <th className="px-8 py-5 text-[10px] font-black text-content-secondary uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">Student</th>
                                          <th className="px-8 py-5 text-[10px] font-black text-content-secondary uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">Reward Type</th>
                                          <th className="px-8 py-5 text-[10px] font-black text-content-secondary uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">Reward</th>
                                          <th className="px-8 py-5 text-[10px] font-black text-content-secondary uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 text-right">Status</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-primary">
                                       {transactions.map((tx, idx) => (
                                          <motion.tr key={tx._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                             <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                   <div className="w-10 h-10 rounded-lg lg:rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-sm text-slate-700 dark:text-slate-400">
                                                      {(tx.invitee?.name || 'S').charAt(0).toUpperCase()}
                                                   </div>
                                                   <div>
                                                      <p className="text-sm font-bold font-outfit uppercase truncate max-w-[150px]">{tx.invitee?.name || 'Student'}</p>
                                                      <p className="text-[10px] font-black text-content-secondary uppercase tracking-tight">{new Date(tx.date).toLocaleDateString()}</p>
                                                   </div>
                                                </div>
                                             </td>
                                             <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-current bg-current opacity-10 text-${rewardColors[tx.rewardType]}-500`}>
                                                   {rewardLabels[tx.rewardType]}
                                                </span>
                                             </td>
                                             <td className="px-8 py-6">
                                                <p className="text-sm font-black text-primary-700 uppercase">+₹{tx.amount}</p>
                                             </td>
                                             <td className="px-8 py-6 text-right">
                                                <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest leading-none mb-1">Balance</p>
                                                <p className="text-sm font-black font-outfit uppercase tracking-tight text-content-secondary">₹{tx.balance?.toLocaleString()}</p>
                                             </td>
                                          </motion.tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </Card>

                           {/* Pagination Controls */}
                           {pagination.totalPages > 1 && (
                              <div className="flex justify-center gap-2 pt-6">
                                 {[...Array(pagination.totalPages)].map((_, i) => (
                                    <button
                                       key={i}
                                       onClick={() => setPage(i + 1)}
                                       className={`w-10 h-10 rounded-lg lg:rounded-xl text-xs font-black transition-all ${page === i + 1 ? 'bg-primary-700 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-content-secondary border border-slate-200 dark:border-slate-700'}`}
                                    >
                                       {i + 1}
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>
                     )}
                  </AnimatePresence>
               </div>
            </div>

         </div>

         <UnifiedFooter />
      </div>
   );
}

