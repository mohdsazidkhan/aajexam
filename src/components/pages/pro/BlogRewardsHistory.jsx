'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
   Book,
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
   FileText,
   CircleAlert,
   Sticker
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../../lib/api';
import UnifiedFooter from "../../UnifiedFooter";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

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

export default function BlogRewardsHistory() {
   const { isMounted, router } = useSSR();

   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [page, setPage] = useState(1);
   const [pagination, setPagination] = useState({});
   const [summary, setSummary] = useState(null);
   const [blogCount, setBlogCount] = useState({ currentCount: 0, limit: 10, remaining: 10, canAddMore: true });
   const [viewMode, setViewMode] = useState('grid');

   const fetchStats = useCallback(async () => {
      try {
         const response = await API.getCurrentMonthBlogCount();
         if (response.success && response.data) setBlogCount(response.data);
      } catch (error) { console.error('Blog stats offline'); }
   }, []);

   const fetchHistory = useCallback(async (p = 1) => {
      setLoading(true);
      try {
         const response = await API.getBlogRewardsHistory({ page: p, limit: 20 });
         if (response?.success) {
            setTransactions(response.data?.transactions || []);
            setPagination(response.data?.pagination || {});
            setSummary(response.data?.summary || null);
         } else {
            setError(response?.message || "Journal stream localized failure");
         }
      } catch (err) {
         setError("Journal link sync failed");
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

   const getTierConfig = (tier) => {
      switch (tier) {
         case 'high': return { color: 'primary', label: 'ELITE JOURNAL' };
         case 'good': return { color: 'emerald', label: 'SCHOLAR ENTRY' };
         default: return { color: 'secondary', label: 'STANDARD LOG' };
      }
   };

   if (!isMounted) return null;

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">
         <div className="container mx-auto px-2 lg:px-6 py-4 space-y-12">

            {/* --- Journal Bounty Hero --- */}
            <section className="relative py-4 lg:py-6 text-center space-y-4 lg:space-y-8">
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Book className="w-10 h-10" />
               </motion.div>
               <div className="space-y-4">
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Journal <span className="text-primary-700 dark:text-primary-500">Bounty</span></h1>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] max-w-2xl mx-auto">Historical stream of earnings from approved academic contributions</p>
               </div>

               <div className="flex justify-center pt-6">
                  <Button variant="secondary" size="lg" onClick={() => router.push('/pro/create-blog')} className="px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-duo-secondary">
                     <PlusCircle className="w-4 h-4 mr-2" /> NEW JOURNAL ENTRY
                  </Button>
               </div>
            </section>

            {/* --- Journal Quota Status --- */}
            <Card className={`p-8 border-2 transition-all ${!blogCount.canAddMore ? 'bg-primary-500/5 border-primary-500/20' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
               <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                     <div className={`p-4 rounded-2xl ${!blogCount.canAddMore ? 'bg-primary-500/10 text-primary-700 dark:text-primary-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        <FileText className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Journal Publication Quota</p>
                        <p className={`text-xl font-black font-outfit uppercase ${!blogCount.canAddMore ? 'text-primary-700 dark:text-primary-500' : 'text-slate-700 dark:text-slate-300'}`}>
                           {blogCount.currentCount} / {blogCount.limit} SYNCED THIS MONTH
                        </p>
                     </div>
                  </div>
                  <div className="flex-1 w-full max-w-sm">
                     <div className="h-3 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(blogCount.currentCount / blogCount.limit) * 100}%` }} className="h-full bg-primary-500 shadow-duo-secondary" />
                     </div>
                     <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-2 flex justify-between">
                        <span>{blogCount.remaining} ENTRIES REMAINING</span>
                        <span>{Math.round((blogCount.currentCount / blogCount.limit) * 100)}% CAPACITY</span>
                     </p>
                  </div>
               </div>
            </Card>

            {/* --- Summary Matrix --- */}
            {summary && (
               <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[
                     { label: 'TOTAL JOURNAL EARNINGS', val: `₹${summary.totalEarnings?.toLocaleString() || 0}`, icon: TrendingUp, color: 'emerald' },
                     { label: 'APPROVED ENTRIES', val: summary.totalBlogs || 0, icon: BarChart3, color: 'secondary' }
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

            {/* --- Registry Registry --- */}
            <section className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white dark:bg-slate-800/50 backdrop-blur-xl p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-500 rounded-xl text-white shadow-duo-secondary">
                     <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">Bounty Transaction Registry</h3>
                     <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Global academic reward extractions</p>
                  </div>
               </div>

               <ViewToggle currentView={viewMode} onViewChange={setViewMode} views={['grid', 'list', 'table']} />
            </section>

            {/* --- Registry Results --- */}
            <AnimatePresence mode="wait">
               {loading ? (
                  <div className="py-24 flex justify-center"><Loading size="lg" /></div>
               ) : error ? (
                  <div className="py-24 text-center space-y-6">
                     <CircleAlert className="w-16 h-16 text-primary-700 dark:text-primary-500 mx-auto" />
                     <h3 className="text-xl font-black font-outfit uppercase">Registry Corrupted</h3>
                     <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{error}</p>
                     <Button variant="primary" onClick={() => fetchHistory(page)}>RETRY SYNC</Button>
                  </div>
               ) : transactions.length === 0 ? (
                  <div className="py-32 text-center space-y-8">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto">
                        <Sticker className="w-12 h-12 text-slate-300" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">Journal Empty</h3>
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">No academic contributions have yielded bounties yet. Publish your first entry to begin.</p>
                     </div>
                     <Button variant="secondary" size="lg" onClick={() => router.push('/pro/create-blog')} className="rounded-full px-10 py-5 text-xs font-black shadow-duo-secondary uppercase tracking-widest">POST FIRST ENTRY</Button>
                  </div>
               ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                           {transactions.map((tx, idx) => {
                              const conf = getTierConfig(tx.rewardTier);
                              return (
                                 <Card key={tx._id || idx} className="group hover:scale-[1.02] transition-all border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 relative overflow-hidden flex flex-col">
                                    <div className="h-48 overflow-hidden relative">
                                       <img
                                          src={tx.article?.featuredImage || '/default_banner.png'}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                          alt="Blog Banner"
                                          onError={(e) => { e.target.src = '/default_banner.png'; }}
                                       />
                                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                       <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                                          <div className={`px-4 py-1.5 rounded-full border border-${conf.color}-500/20 bg-${conf.color}-500/10 text-${conf.color}-500 text-[8px] font-black uppercase tracking-widest`}>
                                             {conf.label}
                                          </div>
                                          <p className="text-xl font-black font-outfit text-emerald-400">+₹{tx.amount?.toLocaleString()}</p>
                                       </div>
                                    </div>

                                    <div className="p-8 flex-1 space-y-4 relative z-10">
                                       <h3 className="text-lg font-black font-outfit uppercase line-clamp-2 leading-tight min-h-[3rem]">{tx.articleTitle || 'VERIFIED BLOG ENTRY'}</h3>

                                       <div className="grid grid-cols-2 gap-4">
                                          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                             <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">VAULT BALANCE</p>
                                             <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">₹{tx.balance?.toLocaleString()}</p>
                                          </div>
                                          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                             <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">SYNCED AT</p>
                                             <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{formatDate(tx.createdAt)}</p>
                                          </div>
                                       </div>

                                       {tx.article?.status && (
                                          <div className="flex items-center gap-2 pt-2">
                                             <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                                             <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest italic">Live Status: {tx.article.status}</p>
                                          </div>
                                       )}
                                    </div>
                                    <Sparkles className="absolute -bottom-8 -right-8 w-40 h-40 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-all pointer-events-none" />
                                 </Card>
                              );
                           })}
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
                                 className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-primary-500 text-white shadow-duo-secondary' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-700 dark:text-primary-500'}`}
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


