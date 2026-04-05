'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
   MessageSquare,
   Send,
   Target,
   Zap,
   ShieldCheck,
   CircleCheck,
   CircleAlert,
   Layers,
   Sparkles,
   ArrowLeft,
   Calendar,
   BarChart3,
   HelpCircle,
   FileText,
   ChevronRight,
   Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../../lib/api';
import { getCurrentUser } from '../../../lib/utils/authUtils';
import UnifiedFooter from '../../UnifiedFooter';
import Loading from '../../Loading';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const PostUserQuestion = () => {
   const router = useRouter();
   const user = getCurrentUser();
   const [questionText, setQuestionText] = useState('');
   const [options, setOptions] = useState(['', '', '', '']);
   const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
   const [loading, setLoading] = useState(false);
   const [focusedField, setFocusedField] = useState(null);
   const [monthlyCount, setMonthlyCount] = useState(null);
   const [dailyCount, setDailyCount] = useState(null);
   const hasFetchedCounts = useRef(false);

   useEffect(() => {
      if (!user) {
         router.push('/login');
         return;
      }
   }, [user, router]);

   useEffect(() => {
      const fetchCounts = async () => {
         if (user && user._id && !hasFetchedCounts.current) {
            hasFetchedCounts.current = true;
            try {
               const [mRes, dRes] = await Promise.all([
                  API.getCurrentMonthQuestionCount(user._id),
                  API.getCurrentDayQuestionCount(user._id)
               ]);
               if (mRes) setMonthlyCount(mRes.data || mRes);
               if (dRes) setDailyCount(dRes.data || dRes);
            } catch (err) {
               setMonthlyCount({ currentCount: 0, limit: 100, remaining: 100, canAddMore: true });
               setDailyCount({ currentCount: 0, limit: 5, remaining: 5, canAddMore: true });
            }
         }
      };
      fetchCounts();
   }, [user]);

   if (!user) return <Loading fullScreen={true} size="lg" />;

   const handleOptionChange = (idx, val) => {
      const next = [...options];
      next[idx] = val;
      setOptions(next);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!questionText.trim() || options.some(o => !o.trim())) {
         toast.error('Protocol Incomplete: Fill all intel fields');
         return;
      }
      if (dailyCount && !dailyCount.canAddMore) return toast.error('Daily Transmission Quota Exceeded');
      if (monthlyCount && !monthlyCount.canAddMore) return toast.error('Monthly Broadcast Quota Exceeded');

      setLoading(true);
      try {
         await API.createUserQuestion({ questionText, options, correctOptionIndex });
         toast.success('Question Broadcast Successful');
         router.push('/pro/questions/mine');
      } catch (err) {
         toast.error(err?.response?.data?.message || 'Transmission failed');
      } finally {
         setLoading(false);
      }
   };

   const formProgress = () => {
      let completed = 0;
      if (questionText.trim()) completed += 20;
      options.forEach(o => { if (o.trim()) completed += 20; });
      return completed;
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">
         <div className="container mx-auto px-2 lg:px-6 max-w-6xl space-y-12">

            {/* --- Transmission Hero --- */}
            <header className="relative flex flex-col lg:flex-row items-center justify-between gap-8 pt-8">
               <div className="space-y-4 text-center lg:text-left">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-500 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
                     <Database className="w-3 h-3" /> INTEL Creation NODE
                  </motion.div>
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight leading-none text-slate-900 dark:text-white">
                     Intel <span className="text-primary-700 dark:text-primary-500">Creation</span>
                  </h1>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Broadcast your knowledge to the global academy network</p>
               </div>

               <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => router.push('/pro/questions/mine')} className="px-8 py-5 rounded-3xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-sm">
                     <Layers className="w-4 h-4 mr-2" /> MY ARCHIVE
                  </Button>
               </div>
            </header>

            {/* --- Quota Status Hub --- */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {[
                  { label: 'DAILY TRANSMISSION', count: dailyCount, color: 'primary', icon: Zap },
                  { label: 'MONTHLY BROADCAST', count: monthlyCount, color: 'secondary', icon: BarChart3 }
               ].map((q, i) => (
                  <Card key={i} className={`p-8 border-2 transition-all ${q.count && !q.count.canAddMore ? 'bg-primary-500/5 border-primary-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800'}`}>
                     <div className="flex items-center gap-6 mb-6">
                        <div className={`p-4 rounded-2xl bg-${q.color === 'primary' ? 'primary' : 'secondary'}-500/10 text-${q.color === 'primary' ? 'primary' : 'secondary'}-500`}>
                           <q.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">{q.label}</p>
                           <h3 className="text-xl font-black font-outfit uppercase">{q.count?.currentCount || 0} / {q.count?.limit || 0} LOGGED</h3>
                        </div>
                     </div>
                     <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${((q.count?.currentCount || 0) / (q.count?.limit || 1)) * 100}%` }} className={`h-full bg-${q.color === 'primary' ? 'primary' : 'secondary'}-500`} />
                     </div>
                     <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-2 flex justify-between">
                        <span>{q.count?.remaining || 0} UNITS REMAINING</span>
                        <span>{Math.round(((q.count?.currentCount || 0) / (q.count?.limit || 1)) * 100)}% CAPACITY</span>
                     </p>
                  </Card>
               ))}
            </section>

            {/* --- Main Input Interface --- */}
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               <div className="lg:col-span-8 space-y-8">
                  {/* Question Input Card */}
                  <Card className="p-10 border-none shadow-2xl bg-white dark:bg-slate-800/80 backdrop-blur-xl relative overflow-hidden group">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary-500 rounded-xl text-white shadow-duo-primary">
                           <HelpCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black font-outfit uppercase tracking-tight">Intel Core Unit</h3>
                     </div>

                     <div className="relative">
                        <textarea
                           className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-xl font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all resize-none min-h-[200px]"
                           placeholder="Synthesize your practice question here..."
                           value={questionText}
                           onChange={e => setQuestionText(e.target.value)}
                        />
                        <div className="absolute bottom-6 right-8 flex items-center gap-2">
                           <p className={`text-[10px] font-black uppercase tracking-widest ${questionText.length > 450 ? 'text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400'}`}>
                              {questionText.length} / 500
                           </p>
                        </div>
                     </div>
                     <Sparkles className="absolute -top-12 -right-12 w-24 lg:w-48 h-24 lg:h-48 text-primary-700 dark:text-primary-500/5 group-focus-within:text-primary-700 dark:text-primary-500/10 transition-colors pointer-events-none" />
                  </Card>

                  {/* Options Input Card */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {[0, 1, 2, 3].map(i => (
                        <motion.div key={i} whileHover={{ y: -5 }}>
                           <Card className={`p-8 border-2 transition-all relative overflow-hidden ${correctOptionIndex === i ? 'border-primary-500 bg-primary-500/[0.03]' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50'}`}>
                              <div className="flex items-center gap-4 mb-4">
                                 <button onClick={() => setCorrectOptionIndex(i)} className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${correctOptionIndex === i ? 'bg-primary-500 text-white shadow-duo-primary scale-110' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                                    {String.fromCharCode(65 + i)}
                                 </button>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Intel Segment {i + 1}</p>
                                 {correctOptionIndex === i && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                                       <CircleCheck className="w-5 h-5 text-primary-700 dark:text-primary-500" />
                                    </motion.div>
                                 )}
                              </div>
                              <input
                                 className="w-full bg-transparent border-none text-lg font-bold placeholder:text-slate-200 dark:placeholder:text-slate-700 focus:outline-none"
                                 placeholder={`Option ${String.fromCharCode(65 + i)}...`}
                                 value={options[i]}
                                 onChange={e => handleOptionChange(i, e.target.value)}
                              />
                              {correctOptionIndex === i && <div className="absolute bottom-0 right-0 p-4 opacity-10"><Target className="w-12 h-12 text-primary-700 dark:text-primary-500" /></div>}
                           </Card>
                        </motion.div>
                     ))}
                  </div>
               </div>

               {/* Sidebar: Synchronization Status */}
               <div className="lg:col-span-4 space-y-8">
                  <Card className="p-8 bg-slate-900 text-white border-none shadow-2xl sticky top-8">
                     <div className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-primary-500 rounded-xl text-white">
                              <Zap className="w-5 h-5" />
                           </div>
                           <div>
                              <h4 className="text-lg font-black font-outfit uppercase tracking-tight">Sync Integrity</h4>
                              <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Protocol validation status</p>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-end justify-between">
                              <p className="text-4xl font-black font-outfit text-primary-700 dark:text-primary-500">{formProgress()}%</p>
                              <p className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-1">DATA COMPLETE</p>
                           </div>
                           <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${formProgress()}%` }} className="h-full bg-gradient-to-r from-primary-600 to-primary-400 shadow-[0_0_20px_rgba(240,43,30,0.3)]" />
                           </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-800">
                           <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${questionText.trim() ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                                 <FileText className="w-3 h-3" />
                              </div>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${questionText.trim() ? 'text-white' : 'text-slate-600'}`}>Core Unit Synthesized</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${options.every(o => o.trim()) ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                                 <Layers className="w-3 h-3" />
                              </div>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${options.every(o => o.trim()) ? 'text-white' : 'text-slate-600'}`}>Intel Blocks Mapped</p>
                           </div>
                        </div>

                        <Button
                           variant="primary"
                           size="lg"
                           disabled={formProgress() < 100 || loading}
                           onClick={handleSubmit}
                           className="w-full py-6 rounded-3xl text-sm font-black uppercase tracking-widest shadow-duo-primary"
                        >
                           {loading ? <Loading size="sm" color="white" /> : (
                              <span className="flex items-center justify-center gap-2">
                                 <Send className="w-4 h-4" /> BROADCAST PROTOCOL
                              </span>
                           )}
                        </Button>

                        <p className="text-[8px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-[0.2em] text-center italic">
                           * Intel subject to high-level verification before academy entry.
                        </p>
                     </div>
                  </Card>

                  {/* Extra Tips Bento */}
                  <div className="p-8 bg-emerald-500/5 border-2 border-emerald-500/10 rounded-[2rem]">
                     <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Quality Guidelines</h5>
                     </div>
                     <ul className="space-y-3">
                        {[
                           'Clear and non-ambiguous logic',
                           'Plausible distractor segments',
                           'Marking the absolute correct intel',
                           'Source verification mandatory'
                        ].map((tip, i) => (
                           <li key={i} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 flex-shrink-0" />
                              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest leading-relaxed">{tip}</p>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </main>

         </div>
         <UnifiedFooter />
      </div>
   );
};

export default PostUserQuestion;

