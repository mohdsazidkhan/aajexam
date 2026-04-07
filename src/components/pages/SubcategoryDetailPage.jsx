'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
   Clock,
   HelpCircle,
   ArrowLeft,
   Trophy,
   Zap,
   ChevronRight,
   ChevronLeft,
   Sparkles,
   Target,
   BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../lib/api';
import QuizStartModal from '../QuizStartModal';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PAGE_SIZE = 12;

const SubcategoryDetailPage = () => {
   const router = useRouter();
   const { subcategoryId } = router.query;
   const [subcategory, setSubcategory] = useState(null);
   const [quizzes, setQuizzes] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [showQuizModal, setShowQuizModal] = useState(false);
   const [selectedQuiz, setSelectedQuiz] = useState(null);

   const fetchSubcategory = useCallback(async () => {
      try {
         const response = await API.request('/api/student/subcategories');
         if (response?.length > 0) {
            const found = response.find(sub => sub._id === subcategoryId);
            setSubcategory(found || null);
         }
      } catch (err) { console.error('Subcategory fetch failed:', err); }
   }, [subcategoryId]);

   const fetchQuizzes = useCallback(async (pageNum) => {
      if (!subcategoryId) return;
      setLoading(true);
      try {
         const res = await API.request(`/api/student/quizzes/public/level-based?subcategory=${subcategoryId}&page=${pageNum}&limit=${PAGE_SIZE}`);
         if (res.success) {
            setQuizzes(res.data);
            setTotalPages(res.pagination.totalPages);
         } else { setError('Failed to load quizzes'); }
      } catch (err) { setError('Connection lost. Please try again.'); }
      finally { setLoading(false); }
   }, [subcategoryId]);

   useEffect(() => {
      if (subcategoryId) {
         fetchSubcategory();
         fetchQuizzes(page);
      }
   }, [subcategoryId, page, fetchSubcategory, fetchQuizzes]);

   const recommendedQuizzes = quizzes.filter((quiz) => quiz.isRecommended).length;

   const handleQuizClick = (quiz) => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) { router.push('/login'); return; }
      setSelectedQuiz(quiz);
      setShowQuizModal(true);
   };

   const handleConfirmQuizStart = (competitionType) => {
      setShowQuizModal(false);
      if (selectedQuiz) {
         localStorage.setItem('quizNavigationData', JSON.stringify({
            fromPage: 'subcategory',
            quizData: selectedQuiz,
            subcategoryId: subcategoryId,
            competitionType,
         }));
         router.push(`/attempt-quiz/${selectedQuiz._id}`);
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">
         <Head>
            <title>{subcategory ? `${subcategory.name} | AajExam` : 'Quizzes'}</title>
         </Head>

         {/* --- Header Section --- */}
         <AnimatePresence mode="wait">
            {subcategory && (
               <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative py-10 lg:py-16 px-4 lg:px-6 overflow-hidden mt-16">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950 z-0" />
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                     <Sparkles className="absolute top-10 left-10 w-24 h-24 text-white/10" />
                     <Target className="absolute bottom-10 right-10 w-24 lg:w-48 h-24 lg:h-48 text-white/5" />
                  </div>

                  <div className="container mx-auto max-w-5xl relative z-10 space-y-8 text-center text-white">
                     <div className="space-y-4">
                        <div className="flex justify-center gap-3">
                           <span className="px-4 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-full shadow-duo-primary">Topic</span>
                           <span className="px-4 py-1.5 bg-white/10 text-white/80 text-xs font-semibold rounded-full backdrop-blur-sm border border-white/10">{subcategory.category?.name || 'Education'}</span>
                        </div>
                        <h1 className="text-2xl lg:text-5xl font-black font-outfit tracking-tight leading-none">{subcategory.name}</h1>
                        <p className="text-base font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed">{subcategory.description || 'Find quizzes in this topic and start practicing right away.'}</p>
                     </div>

                     <div className="flex flex-wrap justify-center gap-8 pt-4">
                        {[
                           { label: 'Quizzes on this page', val: quizzes.length, icon: Trophy },
                           { label: 'Recommended picks', val: recommendedQuizzes, icon: Sparkles },
                           { label: 'Current page', val: `${page}/${Math.max(totalPages, 1)}`, icon: Target }
                        ].map((s, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <div className="p-3 bg-white/10 rounded-2xl">
                                 <s.icon className="w-5 h-5 text-primary-700 dark:text-primary-500" />
                              </div>
                              <div className="text-left">
                                 <p className="text-xs font-semibold opacity-70 leading-none mb-1">{s.label}</p>
                                 <p className="text-base font-black font-outfit">{s.val}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </motion.section>
            )}
         </AnimatePresence>

         <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 space-y-6 lg:space-y-12">

            {/* --- Header Controls --- */}
            <section className="flex flex-col lg:flex-row items-center justify-between gap-6">
               <div className="space-y-1 text-center lg:text-left">
                  <h2 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight flex items-center gap-3">
                     <HelpCircle className="text-primary-700 dark:text-primary-500 w-6 h-6" /> Available <span className="text-primary-700 dark:text-primary-500">quizzes</span>
                  </h2>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Choose a quiz below to start practicing.</p>
               </div>

               <Button variant="ghost" onClick={() => router.back()} className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 text-sm font-semibold shadow-sm hover:text-primary-700 dark:text-primary-500 transition-colors">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back to category
               </Button>
            </section>

            {/* --- Quiz Grid --- */}
            <AnimatePresence mode="wait">
               {loading ? (
                  <div className="py-24 flex justify-center"><Loading size="lg" /></div>
               ) : error ? (
                  <Card className="py-20 text-center border-dashed border-2 border-primary-500/20 rounded-[3rem]">
                     <p className="text-base font-semibold text-primary-700 dark:text-primary-500">{error}</p>
                  </Card>
               ) : quizzes.length === 0 ? (
                  <Card className="py-24 text-center space-y-6 border-dashed border-2 border-slate-200 dark:border-slate-800 rounded-[4.5rem]">
                     <BarChart3 className="w-16 h-16 text-slate-200 mx-auto" />
                     <div className="space-y-2">
                        <h3 className="text-xl font-black font-outfit">No quizzes found</h3>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">There are no active quizzes for this topic right now.</p>
                     </div>
                  </Card>
               ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                     {quizzes.map((quiz, idx) => (
                        <motion.div key={quiz._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                           <Card className="p-5 lg:p-8 h-full flex flex-col justify-between group border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all relative overflow-hidden rounded-[2rem] lg:rounded-[3rem]">
                              <div className="space-y-4 lg:space-y-6">
                                 <div className="flex justify-between items-start">
                                    <div className="p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                                       <Trophy className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                       {quiz.isRecommended && <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">Recommended</span>}
                                       <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-3 py-1 rounded-full">Level {quiz.requiredLevel}</span>
                                    </div>
                                 </div>

                                 <div className="space-y-2">
                                    <h3 className="text-xl font-black font-outfit leading-tight group-hover:text-primary-700 dark:text-primary-500 transition-colors line-clamp-2">{quiz.title}</h3>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-2">{quiz.description || 'Practice this quiz to prepare for your exams and test your knowledge.'}</p>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                       <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-none mb-1">Time limit</p>
                                       <p className="text-sm font-black text-slate-900 dark:text-white"><Clock className="w-3 h-3 inline mr-1" /> {quiz.timeLimit || 30} min</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                       <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-none mb-1">Total marks</p>
                                       <p className="text-sm font-black text-slate-900 dark:text-white"><HelpCircle className="w-3 h-3 inline mr-1" /> {quiz.totalMarks || 'Varies'}</p>
                                    </div>
                                 </div>
                              </div>

                              <div className="pt-8">
                                 <Button variant="primary" fullWidth className="py-5 text-sm font-black shadow-duo-primary group-hover:scale-[1.02] transition-transform rounded-2xl" onClick={() => handleQuizClick(quiz)}>
                                    <Zap className="w-4 h-4 mr-2" /> Start quiz
                                 </Button>
                              </div>

                              <Sparkles className="absolute -bottom-6 -right-6 w-24 h-24 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-colors" />
                           </Card>
                        </motion.div>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>

            {/* --- Pagination --- */}
            {totalPages > 1 && (
               <section className="flex justify-center items-center gap-4 py-8">
                  <Button variant="ghost" disabled={page === 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))} className="w-12 h-12 p-0 rounded-2xl bg-white dark:bg-slate-800 shadow-sm"><ChevronLeft className="w-5 h-5" /></Button>
                  <div className="flex gap-2">
                     {[...Array(totalPages)].map((_, idx) => (
                        <button key={idx} onClick={() => setPage(idx + 1)} className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${page === idx + 1 ? 'bg-slate-900 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>{idx + 1}</button>
                     ))}
                  </div>
                  <Button variant="ghost" disabled={page === totalPages || loading} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="w-12 h-12 p-0 rounded-2xl bg-white dark:bg-slate-800 shadow-sm"><ChevronRight className="w-5 h-5" /></Button>
               </section>
            )}
         </div>

         <QuizStartModal
            isOpen={showQuizModal}
            onClose={() => setShowQuizModal(false)}
            onConfirm={handleConfirmQuizStart}
            quiz={selectedQuiz}
         />

         <UnifiedFooter />
      </div>
   );
};

export default SubcategoryDetailPage;


