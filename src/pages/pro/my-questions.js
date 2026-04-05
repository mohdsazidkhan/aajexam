'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import {
   ArrowLeft,
   Plus,
   Eye,
   Heart,
   Share2,
   MessageCircle,
   Zap,
   ShieldCheck,
   Clock,
   CircleCheck,
   CircleAlert,
   HelpCircle,
   FileText,
   TrendingUp,
   Box,
   Compass,
   Sparkles,
   Layers,
   Search,
   Filter,
   LayoutGrid,
   List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import Loading from '../../components/Loading';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const MyUserQuestions = () => {
   const router = useRouter();
   const [items, setItems] = useState([]);
   const [status, setStatus] = useState('');
   const [page, setPage] = useState(1);
   const [limit] = useState(20);
   const [total, setTotal] = useState(0);
   const [loading, setLoading] = useState(false);
   const [stats, setStats] = useState({
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
   });

   const load = useCallback(async () => {
      setLoading(true);
      try {
         const res = await API.getMyUserQuestions({ status, page, limit });
         if (res?.success) {
            setItems(res.data || []);
            setTotal(res.pagination?.total || 0);
         }
      } catch (err) {
         toast.error('Archive link failure');
      } finally {
         setLoading(false);
      }
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
      } catch (err) {
         console.error('Stats offline');
      }
   }, []);

   useEffect(() => {
      load();
      loadStats();
   }, [load, loadStats]);

   const totalPages = Math.max(1, Math.ceil(total / limit));

   const getStatusConfig = (status) => {
      switch (status) {
         case 'approved': return { color: 'emerald', icon: CircleCheck, label: 'PUBLISHED' };
         case 'rejected': return { color: 'primary', icon: CircleAlert, label: 'REDACTED' };
         default: return { color: 'amber', icon: Clock, label: 'UNDER REVIEW' };
      }
   };

   return (
      <MobileAppWrapper title="Broadcasting Archives">
         <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white mt-0">

            <div className="container mx-auto px-2 lg:px-6 py-4 max-w-7xl space-y-12">

               {/* --- Archives Hero --- */}
               <header className="relative py-4 lg:py-6 text-center space-y-4 lg:space-y-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-20 h-20 bg-primary-500/10 text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                     <Layers className="w-10 h-10" />
                  </motion.div>
                  <div className="space-y-4">
                     <h1 className="text-4xl lg:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-outfit uppercase tracking-tight">Broadcasting <span className="text-primary-500 text-glow-primary">Archives</span></h1>
                     <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] max-w-2xl mx-auto">Database of synthesized knowledge units and transmission logs</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 pt-6">
                     <Button variant="ghost" onClick={() => router.back()} className="px-8 py-5 rounded-3xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> BACK TO TERMINAL
                     </Button>
                     <Button variant="primary" size="lg" onClick={() => router.push('/pro/add-question')} className="px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-duo-primary">
                        <Plus className="w-4 h-4 mr-2" /> NEW BROADCAST
                     </Button>
                  </div>
               </header>

               {/* --- Status Metrics Bento --- */}
               <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { label: 'TOTAL BROADCASTS', val: stats.total, icon: Zap, color: 'slate' },
                     { label: 'ACTIVE REVIEW', val: stats.pending, icon: Clock, color: 'amber' },
                     { label: 'PUBLISHED UNITS', val: stats.approved, icon: CircleCheck, color: 'emerald' },
                     { label: 'REDACTED UNITS', val: stats.rejected, icon: CircleAlert, color: 'primary' }
                  ].map((s, i) => (
                     <Card key={i} className="p-6 border-b-4 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group overflow-hidden relative">
                        <div className="flex items-center gap-4 relative z-10">
                           <div className={`p-4 bg-${s.color === 'slate' ? 'slate-500/10' : `${s.color}-500/10`} text-${s.color === 'slate' ? 'slate-500' : `${s.color}-500`} rounded-2xl`}>
                              <s.icon className="w-6 h-6" />
                           </div>
                           <div className="min-w-0">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                              <p className="text-xl lg:text-2xl font-black font-outfit uppercase truncate">{s.val}</p>
                           </div>
                        </div>
                        <Sparkles className="absolute -bottom-8 -right-8 w-24 h-24 text-slate-500/5 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                     </Card>
                  ))}
               </section>

               {/* --- Archives Navigation Hub --- */}
               <section className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white dark:bg-slate-800/50 backdrop-blur-xl p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-full">
                     {[
                        { id: '', label: 'ALL UNITS', icon: Search },
                        { id: 'pending', label: 'REVIEW', icon: Clock },
                        { id: 'approved', label: 'PUBLISHED', icon: CircleCheck },
                        { id: 'rejected', label: 'REDACTED', icon: CircleAlert }
                     ].map(f => (
                        <button
                           key={f.id}
                           onClick={() => { setPage(1); setStatus(f.id); }}
                           className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${status === f.id ? 'bg-primary-500 text-white shadow-duo-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'}`}
                        >
                           <f.icon className="w-4 h-4" /> {f.label}
                        </button>
                     ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm font-black text-slate-300 uppercase tracking-widest">
                     <span className="hidden lg:inline">INDEX {items.length} / {total}</span>
                     <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex">
                        <button className="p-2 text-primary-500 bg-white dark:bg-slate-700 rounded-lg shadow-sm"><LayoutGrid className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600"><List className="w-4 h-4" /></button>
                     </div>
                  </div>
               </section>

               {/* --- Archives Result Matrix --- */}
               <AnimatePresence mode="wait">
                  {loading ? (
                     <div className="py-24 flex justify-center"><Loading size="lg" /></div>
                  ) : items.length === 0 ? (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center space-y-8">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto">
                           <HelpCircle className="w-12 h-12 text-slate-300" />
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-xl font-black font-outfit uppercase">Archive Void</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">Zero synthesized Questions detected in this sector under current parameters.</p>
                        </div>
                        <Button variant="primary" onClick={() => router.push('/pro/add-question')} className="px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-duo-primary">
                           INITIATE NEW BROADCAST
                        </Button>
                     </motion.div>
                  ) : (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {items.map((q, idx) => {
                           const conf = getStatusConfig(q.status);
                           return (
                              <motion.div key={q._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                                 <Card className="h-full group border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all relative overflow-hidden">
                                    <div className="p-8 space-y-6 relative z-10">
                                       <div className="flex justify-between items-start">
                                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border-2 border-${conf.color}-500/20 bg-${conf.color}-500/5 text-${conf.color}-500 flex items-center gap-2`}>
                                             <conf.icon className="w-4 h-4" /> {conf.label}
                                          </div>
                                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                             {new Date(q.createdAt).toLocaleDateString('en-GB')}
                                          </span>
                                       </div>

                                       <h3 className="text-lg font-black font-outfit uppercase leading-tight group-hover:text-primary-500 transition-colors line-clamp-2 min-h-[3.5rem]">
                                          {q.questionText}
                                       </h3>

                                       <div className="grid grid-cols-2 gap-3">
                                          {q.options?.map((opt, oIdx) => (
                                             <div key={oIdx} className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${oIdx === q.correctOptionIndex ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-slate-50/50 dark:bg-slate-900/50 border-transparent text-slate-400'}`}>
                                                <span className="text-[8px] font-black opacity-50">{String.fromCharCode(65 + oIdx)}</span>
                                                <span className="text-[10px] font-black uppercase truncate">{opt}</span>
                                             </div>
                                          ))}
                                       </div>

                                       <div className="pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                                          <div className="flex gap-4">
                                             {[
                                                { icon: Eye, val: q.viewsCount || 0 },
                                                { icon: Heart, val: q.likesCount || 0 },
                                                { icon: Share2, val: q.sharesCount || 0 },
                                                { icon: MessageCircle, val: (q.answers || []).length }
                                             ].map((m, mi) => (
                                                <div key={mi} className="flex items-center gap-1.5 text-slate-300">
                                                   <m.icon className="w-3 h-3" />
                                                   <span className="text-[10px] font-black">{m.val}</span>
                                                </div>
                                             ))}
                                          </div>
                                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-primary-500 transition-colors shadow-inner">
                                             <ArrowLeft className="w-4 h-4 rotate-180" />
                                          </div>
                                       </div>
                                    </div>
                                    <Sparkles className="absolute -bottom-8 -left-8 w-24 lg:w-48 h-24 lg:h-48 text-primary-500/5 group-hover:text-primary-500/10 transition-colors pointer-events-none" />
                                 </Card>
                              </motion.div>
                           );
                        })}
                     </div>
                  )}
               </AnimatePresence>

               {/* --- Archives Pagination Hub --- */}
               {totalPages > 1 && (
                  <div className="flex justify-center pt-12">
                     <div className="bg-white dark:bg-slate-800 p-2 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                           <button
                              key={i}
                              onClick={() => setPage(i + 1)}
                              className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-primary-500 text-white shadow-duo-primary' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600'}`}
                           >
                              {i + 1}
                           </button>
                        ))}
                     </div>
                  </div>
               )}

            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default MyUserQuestions;
