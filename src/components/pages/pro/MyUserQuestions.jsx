'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
   MessageSquare,
   Search,
   Plus,
   CircleCheck,
   Clock,
   CircleAlert,
   Eye,
   ThumbsUp,
   Share2,
   MessageCircle,
   TrendingUp,
   ShieldCheck,
   Zap,
   BarChart3,
   Layers,
   Sparkles,
   ChevronRight,
   Target,
   ArrowUpRight,
   Database,
   Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../../lib/api';
import UnifiedFooter from '../../UnifiedFooter';
import Loading from '../../Loading';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const MyUserQuestions = () => {
   const router = useRouter();
   const [items, setItems] = useState([]);
   const [status, setStatus] = useState('');
   const [page, setPage] = useState(1);
   const [limit] = useState(20);
   const [total, setTotal] = useState(0);
   const [loading, setLoading] = useState(false);
   const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

   const load = useCallback(async () => {
      setLoading(true);
      try {
         const res = await API.getMyUserQuestions({ status, page, limit });
         if (res?.success) {
            setItems(res.data || []);
            setTotal(res.pagination?.total || 0);
         }
      } catch (err) { console.error('Archive retrieval failed'); }
      finally { setLoading(false); }
   }, [status, page, limit]);

   const loadStats = useCallback(async () => {
      try {
         const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
            API.getMyUserQuestions({ page: 1, limit: 1 }),
            API.getMyUserQuestions({ status: 'pending', page: 1, limit: 1 }),
            API.getMyUserQuestions({ status: 'approved', page: 1, limit: 1 }),
            API.getMyUserQuestions({ status: 'rejected', page: 1, limit: 1 })
         ]);
         setStats({
            total: allRes?.pagination?.total || 0,
            pending: pendingRes?.pagination?.total || 0,
            approved: approvedRes?.pagination?.total || 0,
            rejected: rejectedRes?.pagination?.total || 0
         });
      } catch (err) { console.error('Stats offline'); }
   }, []);

   useEffect(() => {
      load();
      loadStats();
   }, [load, loadStats]);

   const totalPages = Math.max(1, Math.ceil(total / limit));

   const getStatusConfig = (s) => {
      switch (s) {
         case 'approved': return { color: 'emerald', icon: CircleCheck, label: 'VALIDATED' };
         case 'rejected': return { color: 'primary', icon: CircleAlert, label: 'REJECTED' };
         default: return { color: 'secondary', icon: Clock, label: 'UNDER SYNC' };
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">
         <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 space-y-5 lg:space-y-12">

            {/* --- Archive Hero --- */}
            <header className="relative flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 pt-4 lg:pt-8">
               <div className="space-y-2 lg:space-y-4 text-center lg:text-left">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-500 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
                     <Database className="w-3 h-3" /> INTEL ARCHIVE
                  </motion.div>
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight leading-none text-slate-900 dark:text-white">
                     Intel <span className="text-primary-700 dark:text-primary-500">Archive</span>
                  </h1>
                  <p className="text-xs lg:text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em]">Your submitted questions</p>
               </div>

               <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => router.push('/pro/questions/new')} className="px-5 py-3 lg:px-8 lg:py-5 rounded-2xl lg:rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-duo-secondary">
                     <Plus className="w-4 h-4 mr-2" /> NEW
                  </Button>
               </div>
            </header>

            {/* --- Mission Status Hub --- */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
               {[
                  { label: 'TOTAL SYNCED', val: stats.total, icon: Layers, color: 'slate' },
                  { label: 'VALIDATED UNITS', val: stats.approved, icon: ShieldCheck, color: 'emerald' },
                  { label: 'SYNC QUEUE', val: stats.pending, icon: Clock, color: 'secondary' },
                  { label: 'REJECTED LOGS', val: stats.rejected, icon: CircleAlert, color: 'primary' }
               ].map((s, i) => (
                  <Card key={i} className="p-4 lg:p-6 border-b-4 border-slate-100 dark:border-slate-800 hover:border-slate-200 group">
                     <div className="flex items-center gap-3 lg:gap-4">
                        <div className={`p-3 lg:p-4 bg-${s.color === 'slate' ? 'slate-500' : s.color === 'emerald' ? 'emerald-500' : s.color === 'secondary' ? 'primary-500' : 'primary-500'}/10 text-${s.color === 'slate' ? 'slate-500' : s.color === 'emerald' ? 'emerald-500' : s.color === 'secondary' ? 'primary-500' : 'primary-500'} rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform`}>
                           <s.icon className="w-4 h-4 lg:w-6 lg:h-6" />
                        </div>
                        <div>
                           <p className="text-[8px] lg:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                           <p className="text-lg lg:text-2xl font-black font-outfit uppercase truncate">{s.val}</p>
                        </div>
                     </div>
                  </Card>
               ))}
            </section>

            {/* --- Navigation Registry --- */}
            <section className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white dark:bg-slate-800/50 backdrop-blur-xl p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-full">
                  {[
                     { id: '', label: 'ALL INTEL', icon: Database },
                     { id: 'pending', label: 'REVIEW QUEUE', icon: Clock },
                     { id: 'approved', label: 'VALIDATED', icon: CircleCheck },
                     { id: 'rejected', label: 'REJECTED', icon: CircleAlert }
                  ].map(f => (
                     <button
                        key={f.id}
                        onClick={() => { setPage(1); setStatus(f.id); }}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${status === f.id ? 'bg-primary-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-600'}`}
                     >
                        <f.icon className="w-4 h-4" /> {f.label}
                     </button>
                  ))}
               </div>

               <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  REGISTRY NODE: {items.length} / {total} UNITS
               </div>
            </section>

            {/* --- Intel Result Stream --- */}
            <AnimatePresence mode="wait">
               {loading ? (
                  <div className="py-16 flex justify-center"><Loading size="lg" /></div>
               ) : items.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center space-y-6">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                        <MessageSquare className="w-12 h-12 text-slate-300" />
                     </div>
                     <div className="space-y-3">
                        <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">Archive Void Detected</h3>
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">No {status} Questions found in this sector. Synchronize new knowledge to populate the archive.</p>
                     </div>
                     <Button variant="secondary" onClick={() => router.push('/pro/questions/new')} className="px-10 py-5 rounded-full text-xs font-black shadow-duo-secondary uppercase tracking-widest">START NEW Creation</Button>
                  </motion.div>
               ) : (
                  <div className="grid grid-cols-1 gap-4 lg:gap-8">
                     {items.map((q, idx) => {
                        const conf = getStatusConfig(q.status);
                        return (
                           <motion.div key={q._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                              <Card className="p-4 lg:p-8 group hover:border-primary-500/30 transition-all border-2 border-slate-100 dark:border-slate-800 relative overflow-hidden">
                                 <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start relative z-10">
                                    {/* Intel Metadata */}
                                    <div className="w-full lg:w-1/4 space-y-4 lg:space-y-6 lg:border-r border-slate-100 dark:border-slate-800 lg:pr-8">
                                       <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-${conf.color}-500/20 bg-${conf.color}-500/5 text-${conf.color}-500 text-[10px] font-black uppercase tracking-[0.2em]`}>
                                          <conf.icon className="w-4 h-4" /> {conf.label}
                                       </div>

                                       <div className="space-y-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400">
                                                <Calendar className="w-4 h-4" />
                                             </div>
                                             <div>
                                                <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">SYNCHRONIZED</p>
                                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{new Date(q.createdAt).toLocaleDateString()}</p>
                                             </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400">
                                                <Target className="w-4 h-4" />
                                             </div>
                                             <div>
                                                <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">TXN NODE</p>
                                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">#{q._id.slice(-8).toUpperCase()}</p>
                                             </div>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Intel Core Content */}
                                    <div className="flex-1 space-y-4 lg:space-y-8">
                                       <h3 className="text-base lg:text-2xl font-black font-outfit uppercase leading-tight text-slate-900 dark:text-white group-hover:text-primary-700 dark:text-primary-500 transition-colors">
                                          {q.questionText}
                                       </h3>

                                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                                          {(q.options || []).map((option, oIdx) => (
                                             <div key={oIdx} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${oIdx === q.correctOptionIndex ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-400'}`}>
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${oIdx === q.correctOptionIndex ? 'bg-emerald-500 text-white shadow-duo-emerald' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                   {String.fromCharCode(65 + oIdx)}
                                                </div>
                                                <p className="text-sm font-bold truncate uppercase">{option}</p>
                                                {oIdx === q.correctOptionIndex && <CircleCheck className="w-4 h-4 ml-auto" />}
                                             </div>
                                          ))}
                                       </div>

                                       {/* Engagement Matrix */}
                                       <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                                          {[
                                             { icon: Eye, val: q.viewsCount || 0, label: 'SCAN VIEWS' },
                                             { icon: ThumbsUp, val: q.likesCount || 0, label: 'NOD APPROVALS' },
                                             { icon: Share2, val: q.sharesCount || 0, label: 'LINK BROADCASTS' },
                                             { icon: MessageCircle, val: (q.answers || []).length, label: 'FEEDBACK UNITS' }
                                          ].map((stat, sIdx) => (
                                             <div key={sIdx} className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                                   <stat.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                   <p className="text-sm font-black font-outfit uppercase text-slate-900 dark:text-white leading-none">{stat.val}</p>
                                                   <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                                 <Sparkles className="absolute -bottom-12 -right-12 w-64 h-64 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-colors pointer-events-none" />
                              </Card>
                           </motion.div>
                        );
                     })}
                  </div>
               )}
            </AnimatePresence>

            {/* --- Pagination Hub --- */}
            {totalPages > 1 && (
               <div className="flex flex-col lg:flex-row items-center justify-between p-8 bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                     VIEWING {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} OF {total} QuestionS
                  </p>
                  <div className="flex items-center gap-2">
                     {[...Array(totalPages)].map((_, i) => {
                        const p = i + 1;
                        if (p > 5 && p < totalPages) return null; // Simple ellipsis logic
                        return (
                           <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${page === p ? 'bg-primary-500 text-white shadow-duo-secondary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-600'}`}
                           >
                              {p}
                           </button>
                        );
                     })}
                  </div>
               </div>
            )}

         </div>
         <UnifiedFooter />
      </div>
   );
};

export default MyUserQuestions;


