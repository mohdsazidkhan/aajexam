'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
   HelpCircle,
   Wallet,
   Calendar,
   CircleCheck,
   LayoutGrid,
   List,
   Table as TableIcon,
   TrendingUp,
   Zap,
   PlusCircle,
   Search,
   ArrowUpRight,
   ShieldCheck,
   Target,
   Sparkles,
   BarChart3,
   Clock,
   MessageSquare,
   CircleAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../../lib/api';
import UnifiedFooter from "../../UnifiedFooter";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { getCurrentUser } from '../../../utils/authUtils';

// Redesigned ViewToggle Inline
const ViewToggle = ({ currentView, onViewChange, views = ['grid', 'list', 'table'] }) => {
   return (
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shadow-inner">
         {views.includes('grid') && (
            <button onClick={() => onViewChange('grid')} className={`p-2 rounded-xl transition-all ${currentView === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-600'}`}>
               <LayoutGrid className="w-4 h-4" />
            </button>
         )}
         {views.includes('list') && (
            <button onClick={() => onViewChange('list')} className={`p-2 rounded-xl transition-all ${currentView === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-600'}`}>
               <List className="w-4 h-4" />
            </button>
         )}
         {views.includes('table') && (
            <button onClick={() => onViewChange('table')} className={`p-2 rounded-xl transition-all ${currentView === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-600'}`}>
               <TableIcon className="w-4 h-4" />
            </button>
         )}
      </div>
   );
};

export default function UserQuestionRewards() {
   const { isMounted, router } = useSSR();
   const user = getCurrentUser();

   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [page, setPage] = useState(1);
   const [pagination, setPagination] = useState({});
   const [summary, setSummary] = useState(null);
   const [questionCount, setQuestionCount] = useState({ currentCount: 0, limit: 50, remaining: 50, canAddMore: true });
   const [viewMode, setViewMode] = useState('grid');

   const fetchStats = useCallback(async () => {
      if (!user?.id) return;
      try {
         const response = await API.getCurrentMonthQuestionCount(user.id);
         if (response.success && response.data) {
            const { count, monthlyLimit } = response.data;
            setQuestionCount({
               currentCount: count,
               limit: monthlyLimit || 50,
               remaining: Math.max(0, (monthlyLimit || 50) - count),
               canAddMore: count < (monthlyLimit || 50)
            });
         }
      } catch (error) { console.error('Question stats offline'); }
   }, [user?.id]);

   const fetchHistory = useCallback(async (p = 1) => {
      setLoading(true);
      try {
         const response = await API.getQuestionRewardsHistory({ page: p, limit: 20 });
         if (response?.success) {
            setTransactions(response.data?.transactions || []);
            setPagination(response.data?.pagination || {});
            setSummary(response.data?.summary || null);
         } else {
            setError(response?.message || "Intel stream localized failure");
         }
      } catch (err) {
         setError("Intel reward link sync failed");
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      if (isMounted) {
         fetchHistory(page);
         fetchStats();
      }
   }, [isMounted, page, fetchHistory, fetchStats]);

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
         day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
   };

   const getDisplayQuestionText = (tx) => {
      if (tx.questionId && typeof tx.questionId === 'object' && tx.questionId.questionText) return tx.questionId.questionText;
      if (tx.metadata?.questionText) return tx.metadata.questionText;
      if (tx.description) {
         let cleaned = tx.description.replace(/Question approved: |amount credit in user (wallet|waller) for (question )?/gi, '');
         if (!cleaned || cleaned.length < 3) return 'VERIFIED Question';
         return cleaned;
      }
      return 'VERIFIED Question';
   };

   if (!isMounted) return null;

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">
         <div className="container mx-auto px-2 lg:px-6 py-4 space-y-12">

            {/* --- Intel Bounty Hero --- */}
            <section className="relative py-4 lg:py-6 text-center space-y-4 lg:space-y-8">
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <MessageSquare className="w-10 h-10" />
               </motion.div>
               <div className="space-y-4">
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Intel <span className="text-primary-700 dark:text-primary-500">Bounty</span></h1>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] max-w-2xl mx-auto">Historical stream of earnings from approved community Questions</p>
               </div>

               <div className="flex justify-center pt-6">
                  <Button variant="primary" size="lg" onClick={() => router.push('/pro/questions/new')} className="px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-duo-primary">
                     <PlusCircle className="w-4 h-4 mr-2" /> POST NEW Question
                  </Button>
               </div>
            </section>

            {/* --- Intel Quota Status Card --- */}
            <Card className={`p-8 border-2 transition-all ${!questionCount.canAddMore ? 'bg-primary-500/5 border-primary-500/20' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
               <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                     <div className={`p-4 rounded-2xl ${!questionCount.canAddMore ? 'bg-primary-500/10 text-primary-700 dark:text-primary-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        <Target className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Monthly Intel Quota</p>
                        <p className={`text-xl font-black font-outfit uppercase ${!questionCount.canAddMore ? 'text-primary-700 dark:text-primary-500' : 'text-slate-700 dark:text-slate-300'}`}>
                           {questionCount.currentCount} / {questionCount.limit} SYNCED THIS MONTH
                        </p>
                     </div>
                  </div>
                  <div className="flex-1 w-full max-w-sm">
                     <div className="h-3 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(questionCount.currentCount / questionCount.limit) * 100}%` }} className="h-full bg-primary-500 shadow-duo-primary" />
                     </div>
                     <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-2 flex justify-between">
                        <span>{questionCount.remaining} UNITS REMAINING</span>
                        <span>{Math.round((questionCount.currentCount / questionCount.limit) * 100)}% CAPACITY</span>
                     </p>
                  </div>
               </div>
            </Card>

            {/* --- Summary Stats --- */}
            {summary && (
               <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[
                     { label: 'TOTAL INTEL EARNINGS', val: `₹${summary.totalRewards?.toLocaleString() || 0}`, icon: TrendingUp, color: 'primary' },
                     { label: 'APPROVED QuestionS', val: summary.totalTransactions || 0, icon: BarChart3, color: 'secondary' }
                  ].map((s, i) => (
                     <Card key={i} className="p-10 group relative overflow-hidden border-b-8 border-slate-100 dark:border-slate-800 hover:border-slate-300 transition-all">
                        <div className="flex justify-between items-center relative z-10">
                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                              <p className={`text-5xl font-black font-outfit uppercase tracking-tight text-${s.color}-500`}>{s.val}</p>
                           </div>
                           <div className={`p-6 bg-${s.color}-500/10 text-${s.color}-500 rounded-[2rem] shadow-sm`}>
                              <s.icon className="w-10 h-10" />
                           </div>
                        </div>
                        <Sparkles className={`absolute -bottom-8 -right-8 w-24 lg:w-48 h-24 lg:h-48 text-${s.color}-500/5 group-hover:text-${s.color}-500/10 transition-colors pointer-events-none`} />
                     </Card>
                  ))}
               </section>
            )}

            {/* --- Registry Navigation --- */}
            <section className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white dark:bg-slate-800/50 backdrop-blur-xl p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-500 rounded-xl text-white shadow-duo-primary">
                     <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">Intel Transaction Registry</h3>
                     <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Global intellectual reward logs</p>
                  </div>
               </div>

               <ViewToggle currentView={viewMode} onViewChange={setViewMode} views={['grid', 'list', 'table']} />
            </section>

            {/* --- Bounty Results --- */}
            <AnimatePresence mode="wait">
               {loading ? (
                  <div className="py-24 flex justify-center"><Loading size="lg" /></div>
               ) : error ? (
                  <div className="py-24 text-center space-y-6">
                     <CircleAlert className="w-16 h-16 text-primary-700 dark:text-primary-500 mx-auto" />
                     <h3 className="text-xl font-black font-outfit uppercase">Intel Sync Offline</h3>
                     <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{error}</p>
                     <Button variant="primary" onClick={() => fetchHistory(page)}>RETRY SYNC</Button>
                  </div>
               ) : transactions.length === 0 ? (
                  <div className="py-32 text-center space-y-8">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto">
                        <MessageSquare className="w-12 h-12 text-slate-300" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">Intel Void</h3>
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">No community Questions have yielded bounties yet. Feed the academy to earn.</p>
                     </div>
                     <Button variant="primary" size="lg" onClick={() => router.push('/pro/questions/new')} className="rounded-full px-10 py-5 text-xs font-black shadow-duo-primary uppercase tracking-widest">POST FIRST INTEL</Button>
                  </div>
               ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                           {transactions.map((tx, idx) => (
                              <Card key={tx._id || idx} className="p-8 group hover:scale-[1.02] transition-all border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 relative overflow-hidden">
                                 <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-2xl shadow-sm">
                                       <HelpCircle className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">INTEL BOUNTY</p>
                                       <p className="text-xl lg:text-2xl font-black font-outfit text-primary-700 dark:text-primary-500 tracking-tight">+₹{tx.amount?.toLocaleString()}</p>
                                    </div>
                                 </div>

                                 <div className="space-y-4 relative z-10">
                                    <h3 className="text-lg font-black font-outfit uppercase line-clamp-2 leading-tight min-h-[3rem]">{getDisplayQuestionText(tx)}</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                       <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                          <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">VAULT SYNC</p>
                                          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">₹{tx.balance?.toLocaleString()} BALANCE</p>
                                       </div>
                                       <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                          <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">VALIDATED AT</p>
                                          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{formatDate(tx.createdAt)}</p>
                                       </div>
                                    </div>
                                 </div>
                                 <Sparkles className="absolute -bottom-8 -right-8 w-40 h-40 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-all pointer-events-none" />
                              </Card>
                           ))}
                        </div>
                     ) : (
                        <Card className="p-12 text-center text-slate-600 dark:text-slate-400 uppercase font-black text-[10px] tracking-widest">
                           {viewMode} Mode Requires Tactical Console View (Desktop Only)
                           <div className="mt-8">
                              <Button variant="ghost" onClick={() => setViewMode('grid')}>RETURN TO VISUAL GRID</Button>
                           </div>
                        </Card>
                     )}

                     {/* Pagination Hub */}
                     {pagination.pages > 1 && (
                        <div className="flex justify-center gap-2 pt-8">
                           {[...Array(pagination.pages)].map((_, i) => (
                              <button
                                 key={i}
                                 onClick={() => setPage(i + 1)}
                                 className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-primary-500 text-white shadow-duo-primary' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:text-primary-500'}`}
                              >
                                 {i + 1}
                              </button>
                           ))}
                        </div>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>

         </div>
         <UnifiedFooter />
      </div>
   );
}

