'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
   ArrowLeft,
   Layers,
   Target,
   BarChart3,
   Clock,
   ShieldCheck,
   CircleCheck,
   Eye,
   Play,
   Plus,
   Zap,
   Sparkles,
   MoreVertical,
   Edit,
   Trash2,
   HelpCircle,
   FileText,
   BadgeCheck,
   TrendingUp,
   Box,
   Map,
   Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../../lib/api';
import Loading from '../../Loading';
import UnifiedFooter from '../../UnifiedFooter';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const ProQuizDetail = () => {
   const router = useRouter();
   const { quizId } = router.query;
   const [quiz, setQuiz] = useState(null);
   const [loading, setLoading] = useState(true);

   const fetchQuiz = useCallback(async () => {
      if (!quizId) return;
      setLoading(true);
      try {
         // Prefer protected detail (owner view); fallback to public detail if unauthorized
         try {
            const response = await API.getMyQuiz(quizId);
            if (response?.success) { setQuiz(response.data); }
            else {
               const pub = await API.getUserQuizDetails(quizId);
               setQuiz(pub?.data || pub);
            }
         } catch (err) {
            const pub = await API.getUserQuizDetails(quizId);
            setQuiz(pub?.data || pub);
         }
      } catch (error) {
         toast.error('Architecture link sync failed');
      } finally {
         setLoading(false);
      }
   }, [quizId]);

   useEffect(() => {
      fetchQuiz();
   }, [fetchQuiz]);

   if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loading size="lg" /></div>;

   const statusConfig = {
      approved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'PUBLISHED' },
      rejected: { color: 'text-primary-700 dark:text-primary-500', bg: 'bg-primary-500/10', label: 'REDACTED' },
      default: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'PENDING SYNC' }
   };
   const conf = statusConfig[quiz?.status] || statusConfig.default;

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">

         <div className="container mx-auto px-2 lg:px-6 py-4 space-y-12">

            {/* --- Architecture Hero --- */}
            <header className="relative flex flex-col lg:flex-row items-center justify-between gap-8 pt-8">
               <div className="space-y-4 text-center lg:text-left">
                  <motion.button onClick={() => router.back()} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-primary-700 dark:text-primary-500 transition-colors">
                     <ArrowLeft className="w-4 h-4" /> BACK TO ARCHIVES
                  </motion.button>
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight leading-none text-slate-900 dark:text-white">
                     Architecture <span className="text-emerald-500">Insight</span>
                  </h1>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                     <div className={`px-4 py-1.5 rounded-xl ${conf.bg} ${conf.color} flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-current opacity-80`}>
                        <ShieldCheck className="w-4 h-4" /> {conf.label}
                     </div>
                     <div className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                        <Box className="w-4 h-4" /> ID: #{quizId?.slice(-6).toUpperCase()}
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap justify-center gap-4">
                  {quiz?.status === 'approved' && (
                     <Button variant="secondary" onClick={() => router.push(`/quiz/${quiz._id}`)} className="px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-duo-secondary">
                        <Play className="w-4 h-4 mr-2" /> EXECUTE QUIZ
                     </Button>
                  )}
                  {quiz?.status === 'pending' && (
                     <Button variant="primary" onClick={() => router.push(`/pro/quiz/create?edit=${quiz._id}`)} className="px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-duo-primary">
                        <Edit className="w-4 h-4 mr-2" /> MODIFY BLUEPRINT
                     </Button>
                  )}
               </div>
            </header>

            {/* --- Blueprint Matrix --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

               {/* Primary Intel Hub */}
               <div className="lg:col-span-8 space-y-8">
                  <Card className="p-10 border-none shadow-2xl bg-white dark:bg-slate-800 relative overflow-hidden group">
                     <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4">
                           <div className="p-4 bg-emerald-500 rounded-2xl text-white shadow-duo-secondary">
                              <Layers className="w-8 h-8" />
                           </div>
                           <div>
                              <h2 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                                 {quiz?.title}
                              </h2>
                              <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                 <Compass className="w-3 h-3" /> {quiz?.category?.name || 'ACADEMY SECTOR'} â€¢ {quiz?.subcategory?.name || 'GENERIC DOMAIN'}
                              </p>
                           </div>
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest leading-relaxed border-l-4 border-slate-100 dark:border-slate-700 pl-6">
                           {quiz?.description || 'No blueprint breakdown synthesized for this archive.'}
                        </p>
                     </div>
                     <Sparkles className="absolute -bottom-12 -right-12 w-24 lg:w-48 h-24 lg:h-48 text-emerald-500/5 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                  </Card>

                  {/* Intel Assembly Units */}
                  <div className="space-y-6">
                     <div className="flex items-center justify-between px-4">
                        <h3 className="text-xl font-black font-outfit uppercase tracking-tight">Intel Assembly</h3>
                        <div className="px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                           {quiz?.questions?.length || 0} UNITS SYNCED
                        </div>
                     </div>

                     {quiz?.questions?.map((q, idx) => (
                        <motion.div key={q._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                           <Card className="p-8 border-2 border-slate-100 dark:border-slate-800 group hover:border-emerald-500/30 transition-all">
                              <div className="flex flex-col lg:flex-row gap-8">
                                 <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-slate-600 dark:text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                                    {idx + 1}
                                 </div>
                                 <div className="flex-1 space-y-6">
                                    <h4 className="text-lg font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                       {q.questionText}
                                    </h4>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                       {q.options?.map((opt, oIdx) => (
                                          <div key={oIdx} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${oIdx === q.correctAnswerIndex ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500' : 'border-slate-50 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400'}`}>
                                             <span className="text-[10px] font-black uppercase tracking-widest">{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                             {oIdx === q.correctAnswerIndex && <CircleCheck className="w-4 h-4" />}
                                          </div>
                                       ))}
                                    </div>
                                    <div className="flex items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                                       <Clock className="w-3 h-3 text-slate-300" />
                                       <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">EXTRACTION LIMIT: {q.timeLimit} SECONDS</span>
                                    </div>
                                 </div>
                              </div>
                           </Card>
                        </motion.div>
                     ))}
                  </div>
               </div>

               {/* Tactical Metadata Hub */}
               <aside className="lg:col-span-4 space-y-8">
                  <Card className="p-8 bg-slate-900 text-white border-none shadow-2xl sticky top-8 space-y-10 overflow-hidden group">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-duo-secondary">
                           <Zap className="w-5 h-5" />
                        </div>
                        <div>
                           <h4 className="text-lg font-black font-outfit uppercase tracking-tight">Performance Matrix</h4>
                           <p className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">Real-time asset Stats</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-6">
                        {[
                           { label: 'TOTAL VIEWS', val: quiz?.viewsCount || 0, icon: Eye, color: 'emerald' },
                           { label: 'ARCHIVE ATTEMPTS', val: quiz?.attemptsCount || 0, icon: Target, color: 'emerald' },
                           { label: 'Creation RATIO', val: `${Math.round(((quiz?.attemptsCount || 0) / (quiz?.viewsCount || 1)) * 100)}%`, icon: TrendingUp, color: 'emerald' }
                        ].map((s, i) => (
                           <div key={i} className="p-6 bg-slate-800 rounded-2xl border border-slate-700 flex justify-between items-center group/item hover:bg-slate-700 transition-all">
                              <div>
                                 <p className="text-[8px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                                 <p className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight">{s.val}</p>
                              </div>
                              <s.icon className={`w-8 h-8 text-${s.color}-500 opacity-20 group-hover/item:opacity-100 transition-opacity`} />
                           </div>
                        ))}
                     </div>

                     <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">DIFFICULTY TIER</label>
                           <div className="p-4 bg-slate-800 rounded-xl border-l-4 border-emerald-500 font-black text-xs uppercase tracking-widest">{quiz?.difficulty}</div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">EXTRACTION TIME</label>
                           <div className="p-4 bg-slate-800 rounded-xl border-l-4 border-emerald-500 font-black text-xs uppercase tracking-widest">{quiz?.timeLimit} MINUTES</div>
                        </div>
                     </div>

                     <div className="pt-6">
                        <Button variant="secondary" onClick={() => router.push('/pro/quizzes/mine')} fullWidth className="py-6 rounded-2xl text-[10px] font-black uppercase shadow-duo-secondary">
                           DOWNLOAD COMPLETE ARCHIVE
                        </Button>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.25em] text-center mt-6 italic">
                           * Data updated from Academy global registry.
                        </p>
                     </div>
                     <Sparkles className="absolute -bottom-24 -right-24 w-64 h-64 text-emerald-500/5 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                  </Card>

                  {/* Tips Bento */}
                  <div className="p-8 bg-emerald-500/5 border-2 border-emerald-500/10 rounded-[2.5rem] space-y-6">
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Architect Security</h5>
                     </div>
                     <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                        This unit is synchronized with high-level academy encryption. Only valid architects can modify blueprints after redaction.
                     </p>
                     <Button variant="ghost" onClick={() => router.push('/pro/quiz/create')} className="w-full text-emerald-500 text-[8px] font-black uppercase">CREATE NEW ARCHITECTURE <Plus className="w-3 h-3 ml-2" /></Button>
                  </div>
               </aside>
            </div>

         </div>
         <UnifiedFooter />
      </div>
   );
};

export default ProQuizDetail;

