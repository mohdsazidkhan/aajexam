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
import Loading from "../Loading";
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
      'registration': 'STUDENT REGISTERED',
      'plan9': '₹9 PLAN ACTIVATED',
      'plan49': '₹49 PLAN ACTIVATED',
      'plan99': '₹99 PLAN ACTIVATED',
   };

   const rewardColors = {
      'registration': 'primary',
      'plan9': 'secondary',
      'plan49': 'amber',
      'plan99': 'emerald',
   };

   return (
      <div className="min-h-screen animate-fade-in selection:bg-primary-500 selection:text-white">

         <div className="container mx-auto mt-0 space-y-4 lg:space-y-8">

            {/* --- Header Section --- */}
            <section className="relative py-4 lg:py-6 text-center space-y-4 lg:space-y-8">
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 bg-primary-500/10 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border-2 border-primary-500/10">
                  <Users className="w-10 h-10" />
               </motion.div>
               <div className="space-y-4">
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Referral <span className="text-primary-600">History</span></h1>
                  <p className="text-sm font-bold text-content-secondary uppercase tracking-[0.3em] max-w-2xl mx-auto">Share your link with friends. When they join and buy a plan, you earn money.</p>
               </div>

               {/* Referral Link Card */}
               {user && (
                  <Card className="max-w-xl mx-auto p-2 bg-background-surface/80 backdrop-blur-xl border-none shadow-2xl rounded-[2.5rem] mt-12">
                     <div className="flex items-center gap-2 p-2">
                        <div className="flex-1 text-left min-w-0">
                           <p className="text-[8px] font-black text-content-secondary uppercase tracking-widest leading-none mb-1">Your Invite Code</p>
                           <p className="text-sm font-bold font-mono tracking-wider truncate text-primary-600">{user.referralCode}</p>
                        </div>
                        <Button variant="primary" size="lg" className="rounded-full px-8 py-4 text-xs font-black shadow-duo-primary" onClick={() => copyToClipboard(`https://aajexam.com/register?ref=${user.referralCode}`)}>
                           <Copy className="w-4 h-4 mx-auto" /> COPY LINK
                        </Button>
                     </div>
                  </Card>
               )}
            </section>

            {/* --- Stats Grid --- */}
            {user && (
               <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {[
                     { label: 'Money You Earned', val: `₹${(user.referralRewards?.reduce((s, r) => s + (r.amount || 0), 0) || 0).toLocaleString()}`, icon: Wallet, color: 'emerald' },
                     { label: 'Friends Referred', val: user.referralCount || 0, icon: UserPlus, color: 'primary' },
                     { label: 'Times Rewarded', val: user.referralRewards?.length || 0, icon: Gift, color: 'secondary' },
                     { label: 'Who Referred You', val: user.referredBy || 'Direct', icon: ShieldCheck, color: 'amber' }
                  ].map((s, i) => (
                     <Card key={i} className="p-5 lg:p-8 group hover:scale-[1.02] transition-transform border-b-4 border-border-primary hover:border-slate-300 dark:hover:border-slate-700 rounded-[2rem] lg:rounded-[2.5rem]">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

               {/* Left Sidebar: Breakdown */}
               <div className="lg:col-span-1 space-y-8">
                  <div className="space-y-2">
                     <h2 className="text-xl font-black font-outfit uppercase tracking-tight">How You <span className="text-primary-600">Earned</span></h2>
                     <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest">See which type of referral gave you how much money</p>
                  </div>

                  <div className="space-y-4">
                     {[
                        { label: 'When Friend Signs Up', type: 'registration', color: 'primary' },
                        { label: 'Friend Buys ₹9 Plan', type: 'plan9', color: 'secondary' },
                        { label: 'Friend Buys ₹49 Plan', type: 'plan49', color: 'amber' },
                        { label: 'Friend Buys ₹99 Plan', type: 'plan99', color: 'emerald' }
                     ].map((b, i) => {
                        const amount = user?.referralRewards?.filter(r => r.type === b.type).reduce((s, r) => s + (r.amount || 0), 0) || 0;
                        const count = user?.referralRewards?.filter(r => r.type === b.type).length || 0;
                        return (
                           <Card key={i} className="p-6 relative overflow-hidden group rounded-2xl">
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

               {/* Right Area: Friend List */}
               <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="space-y-2">
                        <h2 className="text-xl font-black font-outfit uppercase tracking-tight">Referral <span className="text-primary-600">Logs</span></h2>
                        <p className="text-[10px] font-black text-content-secondary uppercase tracking-widest">Students who signed up using your referral link</p>
                     </div>
                     <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                        <History className="w-5 h-5 text-content-secondary" />
                     </div>
                  </div>

                  <AnimatePresence mode="wait">
                     {loading ? (
                        <div className="py-24 flex justify-center"><Loading size="lg" /></div>
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
                        <div className="space-y-4">
                           <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-slate-800/80 rounded-[3rem]">
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left border-collapse">
                                    <thead className="/50">
                                       <tr>
                                          <th className="px-8 py-5 text-[10px] font-black text-content-secondary uppercase tracking-widest border-b border-border-primary">Student</th>
                                          <th className="px-8 py-5 text-[10px] font-black text-content-secondary uppercase tracking-widest border-b border-border-primary">Reward Type</th>
                                          <th className="px-8 py-5 text-[10px] font-black text-content-secondary uppercase tracking-widest border-b border-border-primary">Reward</th>
                                          <th className="px-8 py-5 text-[10px] font-black text-content-secondary uppercase tracking-widest border-b border-border-primary text-right">Status</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-primary">
                                       {transactions.map((tx, idx) => (
                                          <motion.tr key={tx._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                             <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                   <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-sm text-slate-700 dark:text-slate-400">
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
                                                <p className="text-sm font-black text-emerald-500 uppercase">+₹{tx.amount}</p>
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
                                       className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === i + 1 ? 'bg-primary-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-content-secondary border border-slate-200 dark:border-slate-700'}`}
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

