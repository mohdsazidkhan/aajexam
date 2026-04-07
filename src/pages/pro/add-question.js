'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import {
   ArrowLeft,
   Plus,
   Minus,
   Send,
   Zap,
   ShieldCheck,
   Target,
   BarChart3,
   Clock,
   CircleCheck,
   CircleAlert,
   HelpCircle,
   FileText,
   BadgeCheck,
   TrendingUp,
   Box,
   Map,
   Compass,
   MessageSquare,
   Sparkles,
   Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/Loading';

const AddQuestionPage = () => {
   const router = useRouter();
   const [formData, setFormData] = useState({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      category: '',
      difficulty: 'medium'
   });
   const [categories, setCategories] = useState([]);
   const [loading, setLoading] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [questionCount, setQuestionCount] = useState({
      currentCount: 0,
      limit: 100,
      remaining: 100,
      canAddMore: true
   });
   const [dailyCount, setDailyCount] = useState({
      currentCount: 0,
      limit: 5,
      remaining: 5,
      canAddMore: true
   });

   const fetchData = useCallback(async () => {
      setLoading(true);
      try {
         const [catRes, monthRes, dayRes] = await Promise.all([
            API.getPublicCategories(),
            API.getCurrentMonthQuestionCount(),
            API.getCurrentDayQuestionCount()
         ]);

         if (catRes.success) setCategories(catRes.data || []);
         if (monthRes.success) setQuestionCount(monthRes.data);
         if (dayRes.success) setDailyCount(dayRes.data);
      } catch (error) {
         toast.error('Global data sync failed');
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   const handleOptionChange = (index, value) => {
      const newOptions = [...formData.options];
      newOptions[index] = value;
      setFormData({ ...formData, options: newOptions });
   };

   const validateForm = () => {
      if (!dailyCount.canAddMore) {
         toast.error(`Daily limit of ${dailyCount.limit} reached. Transmission suspended.`);
         return false;
      }
      if (!questionCount.canAddMore) {
         toast.error(`Monthly limit of ${questionCount.limit} reached. Archive full.`);
         return false;
      }
      if (!formData.question.trim() || formData.question.length < 10) {
         toast.error('Intel text too short (Min 10 chars)');
         return false;
      }
      if (formData.options.some(opt => !opt.trim())) {
         toast.error('All response options must be synthesized');
         return false;
      }
      if (!formData.category) {
         toast.error('Sector designation required');
         return false;
      }
      if (!formData.explanation.trim() || formData.explanation.length < 20) {
         toast.error('Detailed reasoning required (Min 20 chars)');
         return false;
      }
      return true;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setSubmitting(true);
      try {
         const payload = {
            questionText: formData.question.trim(),
            options: formData.options.map(opt => opt.trim()),
            correctOptionIndex: formData.correctAnswer,
            explanation: formData.explanation.trim(),
            category: formData.category,
            difficulty: formData.difficulty,
         };

         const response = await API.createUserQuestion(payload);

         if (response.success) {
            toast.success('Intel Broadcast Successful! Awaiting Academy Decryption');
            router.push('/pro/my-questions');
         } else {
            toast.error(response.message || 'Transmission Intercepted');
         }
      } catch (error) {
         toast.error('Global transmission failure');
      } finally {
         setSubmitting(false);
      }
   };

   if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loading size="lg" /></div>;

   return (
      <MobileAppWrapper title="Broadcast Intel">
         <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white mt-0">

            <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 max-w-5xl space-y-12">

               {/* --- Broadcasting Hero --- */}
               <header className="relative py-4 lg:py-6 text-center space-y-4 lg:space-y-8">
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 bg-primary-500/10 text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                     <Zap className="w-10 h-10 animate-pulse" />
                  </motion.div>
                  <div className="space-y-4">
                     <h1 className="text-4xl lg:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-outfit uppercase tracking-tight">Broadcasting <span className="text-primary-500 text-glow-primary">Terminal</span></h1>
                     <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] max-w-2xl mx-auto">Transmit high-yield Questions to the academy database</p>
                  </div>

                  <div className="flex justify-center pt-6">
                     <button onClick={() => router.back()} className="px-8 py-3 rounded-full bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 dark:border-slate-800 flex items-center gap-2 hover:text-primary-500 transition-colors shadow-sm">
                        <ArrowLeft className="w-4 h-4" /> ABORT TRANSMISSION
                     </button>
                  </div>
               </header>

               {/* --- Progress Bento --- */}
               <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-8 border-b-4 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group overflow-hidden relative">
                     <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-4 bg-primary-500/10 text-primary-500 rounded-2xl">
                           <Clock className="w-6 h-6" />
                        </div>
                        <BadgeCheck className={`w-6 h-6 ${dailyCount.canAddMore ? 'text-emerald-500' : 'text-slate-300'}`} />
                     </div>
                     <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DAILY COMM BANDWIDTH</p>
                        <h4 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight">{dailyCount.currentCount} / {dailyCount.limit} UNITS</h4>
                     </div>
                     <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden relative z-10">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(dailyCount.currentCount / dailyCount.limit) * 100}%` }} className="h-full bg-primary-500 shadow-duo-primary" />
                     </div>
                     <Sparkles className="absolute -bottom-8 -right-8 w-20 lg:w-32 h-20 lg:h-32 text-primary-500/5 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                  </Card>

                  <Card className="p-8 border-b-4 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group overflow-hidden relative">
                     <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-4 bg-primary-500/10 text-primary-500 rounded-2xl">
                           <BarChart3 className="w-6 h-6" />
                        </div>
                        <BadgeCheck className={`w-6 h-6 ${questionCount.canAddMore ? 'text-emerald-500' : 'text-slate-300'}`} />
                     </div>
                     <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MONTHLY ARCHIVE QUOTA</p>
                        <h4 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight">{questionCount.currentCount} / {questionCount.limit} UNITS</h4>
                     </div>
                     <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden relative z-10">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(questionCount.currentCount / questionCount.limit) * 100}%` }} className="h-full bg-primary-500 shadow-duo-secondary" />
                     </div>
                     <Sparkles className="absolute -bottom-8 -right-8 w-20 lg:w-32 h-20 lg:h-32 text-primary-500/5 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                  </Card>
               </section>

               {/* --- Creation Form --- */}
               <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">

                  {/* Section 1: Intel Content */}
                  <Card className="p-10 space-y-10 border-none shadow-2xl bg-white dark:bg-slate-800 rounded-[3rem]">
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2 underline underline-offset-4 decoration-primary-500/40">
                           <MessageSquare className="w-4 h-4 text-primary-500" /> DEFINE INTEL TEXT
                        </label>
                        <textarea
                           value={formData.question}
                           onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                           className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-xl font-black font-outfit uppercase outline-none focus:border-primary-500 transition-all placeholder:text-slate-200"
                           rows="4"
                           placeholder="ENTER THE KNOWLEDGE QUERY UNIT..."
                           required
                        />
                     </div>

                     {/* Options Grid */}
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2 underline underline-offset-4 decoration-primary-500/40">
                           <Layers className="w-4 h-4 text-primary-500" /> SYNTHESIZE RESPONSE OPTIONS
                        </label>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-2 mb-4">IDENTIFY THE VERIFIED OPTION BY SELECTING THE ALPHA TOKEN</p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           {formData.options.map((option, index) => (
                              <div key={index} className={`flex items-center gap-4 group transition-all`}>
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, correctAnswer: index })}
                                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black transition-all ${formData.correctAnswer === index
                                       ? 'bg-primary-500 border-primary-500 text-white shadow-duo-primary scale-110'
                                       : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-primary-500/30'
                                       }`}
                                 >
                                    {String.fromCharCode(65 + index)}
                                 </button>
                                 <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className={`flex-1 px-6 py-4 border-2 rounded-2xl text-xs font-bold uppercase transition-all outline-none ${formData.correctAnswer === index ? 'bg-primary-500/5 border-primary-500/50' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 focus:border-primary-500'}`}
                                    placeholder={`ENTER OPTION ${String.fromCharCode(65 + index)}`}
                                    required
                                 />
                              </div>
                           ))}
                        </div>
                     </div>
                  </Card>

                  {/* Section 2: Metadata Protocol */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card className="p-8 space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                           <Compass className="w-4 h-4 text-primary-500" /> SECTOR DESIGNATION
                        </label>
                        <select
                           value={formData.category}
                           onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                           className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-xs font-black uppercase tracking-widest outline-none focus:border-primary-500 transition-all"
                           required
                        >
                           <option value="">-- ACCESS ARC SECTORS --</option>
                           {categories.map((category) => (
                              <option key={category._id} value={category._id}>{category.name}</option>
                           ))}
                        </select>
                     </Card>

                     <Card className="p-8 space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                           <TrendingUp className="w-4 h-4 text-emerald-500" /> COMPLEXITY TIER
                        </label>
                        <div className="flex gap-4">
                           {['easy', 'medium', 'hard'].map(level => (
                              <button
                                 key={level}
                                 type="button"
                                 onClick={() => setFormData({ ...formData, difficulty: level })}
                                 className={`flex-1 py-5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${formData.difficulty === level
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-duo-secondary'
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-500/30'
                                    }`}
                              >
                                 {level}
                              </button>
                           ))}
                        </div>
                     </Card>
                  </div>

                  {/* Section 3: Reasoning Protocol */}
                  <Card className="p-10 space-y-10 border-none shadow-2xl bg-white dark:bg-slate-800 rounded-[3rem] relative overflow-hidden">
                     <div className="space-y-6 relative z-10">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2 underline underline-offset-4 decoration-primary-500/40">
                           <FileText className="w-4 h-4 text-primary-500" /> BROADCAST REASONING
                        </label>
                        <textarea
                           value={formData.explanation}
                           onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                           className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-sm font-bold uppercase tracking-widest outline-none focus:border-primary-500 transition-all placeholder:text-slate-200"
                           rows="4"
                           placeholder="SYNOPSIS OF VERIFIED DATA AND LOGIC..."
                           required
                        />
                     </div>

                     {/* Protocol Guidelines */}
                     <div className="p-6 bg-primary-500/10 rounded-2xl border border-primary-500/20 relative z-10">
                        <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.25em] mb-4 flex items-center gap-4">
                           <ShieldCheck className="w-5 h-5" /> ACADEMY PROTOCOL GUIDELINES
                        </h4>
                        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3">
                           {[
                              'Clear unambiguous intellectual units',
                              'High-yield response alternatives',
                              'Detailed Creation breakdown',
                              'Verified empirical knowledge',
                           ].map((item, i) => (
                              <li key={i} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" /> {item}
                              </li>
                           ))}
                        </ul>
                     </div>
                     <Sparkles className="absolute -bottom-12 -right-12 w-24 lg:w-48 h-24 lg:h-48 text-primary-500/5 pointer-events-none" />
                  </Card>

                  {/* Submit Command */}
                  <div className="pt-8">
                     <Button
                        type="submit"
                        disabled={submitting || !questionCount.canAddMore || !dailyCount.canAddMore}
                        variant="primary"
                        fullWidth
                        className="py-8 rounded-[2rem] text-sm font-black shadow-duo-primary uppercase tracking-[0.2em]"
                     >
                        {!dailyCount.canAddMore
                           ? "DAILY BANDWIDTH EXHAUSTED"
                           : !questionCount.canAddMore
                              ? "MONTHLY ARCHIVE FULL"
                              : submitting
                                 ? "TRANSMITTING TO ACADEMY..."
                                 : "âœ“ INITIATE BROADCAST PROTOCOL"
                        }
                     </Button>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] text-center mt-8 italic">
                        * ALL BROADCASTS ARE ENCRYPTED AND SUBJECT TO PEER REVIEW
                     </p>
                  </div>
               </form>

            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default AddQuestionPage;

