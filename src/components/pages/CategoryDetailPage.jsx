'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
   Clock,
   HelpCircle,
   Folder,
   ChevronRight,
   ArrowLeft,
   Trophy,
   Sparkles,
   Target,
   Map,
   BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../lib/api';
import QuizStartModal from '../QuizStartModal';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PAGE_SIZE = 12;

const CategoryDetailPage = () => {
   const router = useRouter();
   const { categoryId } = router.query;
   const [category, setCategory] = useState(null);
   const [subcategories, setSubcategories] = useState([]);
   const [quizzes, setQuizzes] = useState([]);
   const [loading, setLoading] = useState(true);
   const [subLoading, setSubLoading] = useState(true);
   const [error, setError] = useState('');
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [showQuizModal, setShowQuizModal] = useState(false);
   const [selectedQuiz, setSelectedQuiz] = useState(null);

   const fetchCategory = useCallback(async () => {
      try {
         const categories = await API.getCategories();
         const found = categories.find(cat => cat._id === categoryId);
         setCategory(found || null);
      } catch { setCategory(null); }
   }, [categoryId]);

   const fetchSubcategories = useCallback(async () => {
      try {
         setSubLoading(true);
         const res = await API.getSubcategories(categoryId);
         setSubcategories(res || []);
      } catch { setSubcategories([]); }
      finally { setSubLoading(false); }
   }, [categoryId]);

   const fetchQuizzes = useCallback(async (pageNum) => {
      if (!categoryId) return;
      setLoading(true);
      try {
         const res = await API.request(`/api/student/quizzes/public/level-based?category=${categoryId}&page=${pageNum}&limit=${PAGE_SIZE}`);
         if (res.success) {
            setQuizzes(res.data);
            setTotalPages(res.pagination.totalPages);
         } else { setError('Failed to load quizzes'); }
      } catch { setError('Connection lost. Please try again.'); }
      finally { setLoading(false); }
   }, [categoryId]);

   useEffect(() => {
      if (categoryId) {
         fetchCategory();
         fetchSubcategories();
         fetchQuizzes(page);
      }
   }, [categoryId, page, fetchCategory, fetchSubcategories, fetchQuizzes]);

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
            fromPage: 'category',
            quizData: selectedQuiz,
            competitionType,
         }));
         router.push(`/attempt-quiz/${selectedQuiz._id}`);
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">
         <Head>
            <title>{category ? `${category.name} | AajExam` : 'Category Overview'}</title>
         </Head>

         {/* --- Header Section --- */}
         <AnimatePresence mode="wait">
            {category && (
               <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative px-4 lg:px-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-900 z-0" />
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                     <Map className="absolute top-10 left-10 w-24 h-24 text-white/10" />
                     <BookOpen className="absolute bottom-10 right-10 w-24 lg:w-48 h-24 lg:h-48 text-white/5" />
                  </div>

                  <div className="container mx-auto max-w-5xl relative z-10 space-y-8 text-center text-white">
                     <div className="space-y-4">
                        <div className="flex justify-center gap-3">
                           <span className="px-4 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-full shadow-duo-secondary">Category</span>
                           <span className="px-4 py-1.5 bg-white/10 text-white/80 text-xs font-semibold rounded-full backdrop-blur-sm border border-white/10">Practice quizzes</span>
                        </div>
                        <h1 className="text-2xl lg:text-5xl font-black font-outfit tracking-tight leading-none">{category.name}</h1>
                        <p className="text-base font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed">{category.description || 'Pick a topic inside this category and start practicing.'}</p>
                     </div>

                     <div className="flex flex-wrap justify-center gap-8 pt-4">
                        {[
                           { label: 'Topics', val: subcategories.length, icon: Folder },
                           { label: 'Quizzes here', val: quizzes.length, icon: Trophy },
                           { label: 'Current page', val: `${page}/${Math.max(totalPages, 1)}`, icon: Target }
                        ].map((s, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <div className="p-3 bg-white/10 rounded-2xl border border-white/5">
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

         <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 space-y-6 lg:space-y-16">

            {/* --- Back Control --- */}
            <div className="flex justify-start">
               <Button variant="ghost" onClick={() => router.push('/home')} className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 text-sm font-semibold shadow-sm hover:text-primary-700 dark:text-primary-500 transition-colors">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back to home
               </Button>
            </div>

            {/* --- Subcategories Grid --- */}
            <section className="space-y-8">
               <div className="space-y-1">
                  <h2 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight flex items-center gap-3">
                     <Folder className="text-primary-700 dark:text-primary-500 w-6 h-6" /> Explore <span className="text-primary-700 dark:text-primary-500">topics</span>
                  </h2>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tap on a topic to see all quizzes inside it.</p>
               </div>

               <AnimatePresence mode="wait">
                  {subLoading ? (
                     <div className="py-12 flex justify-center"><Loading size="md" /></div>
                  ) : subcategories.length === 0 ? (
                     <Card className="py-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent rounded-[3rem]">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No topics have been added to this category yet.</p>
                     </Card>
                  ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
                        {subcategories.map((sub, idx) => (
                           <motion.div key={sub._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} onClick={() => router.push(`/subcategory/${sub._id}`)}>
                              <Card className="p-4 lg:p-6 group cursor-pointer border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all rounded-[1.5rem] lg:rounded-[2rem]">
                                 <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                                       <Folder className="w-5 h-5" />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 group-hover:text-primary-700 dark:text-primary-500 transition-all" />
                                 </div>
                                 <h3 className="text-lg font-black font-outfit truncate group-hover:text-primary-700 dark:text-primary-500 transition-colors">{sub.name}</h3>
                                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">See quizzes</p>
                              </Card>
                           </motion.div>
                        ))}
                     </motion.div>
                  )}
               </AnimatePresence>
            </section>

            {/* --- Quizzes Grid --- */}
            <section className="space-y-8">
               <div className="space-y-1">
                  <h2 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight flex items-center gap-3">
                     <Trophy className="text-primary-700 dark:text-primary-500 w-6 h-6" /> Available <span className="text-primary-700 dark:text-primary-500">quizzes</span>
                  </h2>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Start with any quiz below to practice this category.</p>
               </div>

               <AnimatePresence mode="wait">
                  {loading ? (
                     <div className="py-24 flex justify-center"><Loading size="lg" /></div>
                  ) : quizzes.length === 0 ? (
                     <Card className="py-24 text-center space-y-6 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent rounded-[4rem]">
                        <Target className="w-16 h-16 text-slate-200 mx-auto" />
                        <div className="space-y-2">
                           <h3 className="text-xl font-black font-outfit">No quizzes found</h3>
                           <p className="text-sm font-medium text-slate-600 dark:text-slate-400">There are no active quizzes for this category right now.</p>
                        </div>
                     </Card>
                  ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                           {quizzes.map((quiz, idx) => (
                              <motion.div key={quiz._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                                 <Card className="p-4 lg:p-8 h-full flex flex-col justify-between group border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all relative overflow-hidden rounded-[2rem] lg:rounded-[3rem]">
                                    <div className="space-y-6">
                                       <div className="flex justify-between items-start">
                                          <div className="p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                                             <Trophy className="w-6 h-6" />
                                          </div>
                                          <div className="flex flex-col items-end gap-2">
                                             <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-3 py-1 rounded-full">Level {quiz.requiredLevel}</span>
                                             {quiz.isRecommended && <Sparkles className="w-4 h-4 text-amber-500" />}
                                          </div>
                                       </div>
                                       <h3 className="text-xl font-black font-outfit leading-tight group-hover:text-primary-700 dark:text-primary-500 transition-colors line-clamp-2">{quiz.title}</h3>
                                       <div className="grid grid-cols-2 gap-4">
                                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                             <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Time limit</p>
                                             <p className="text-sm font-black text-slate-900 dark:text-white"><Clock className="w-3 h-3 inline mr-1" /> {quiz.timeLimit || 30} min</p>
                                          </div>
                                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                             <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Total marks</p>
                                             <p className="text-sm font-black text-slate-900 dark:text-white"><HelpCircle className="w-3 h-3 inline mr-1" /> {quiz.totalMarks || 'Varies'}</p>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="pt-8">
                                       <Button variant="primary" fullWidth className="py-5 text-sm font-black shadow-duo-primary rounded-2xl" onClick={() => handleQuizClick(quiz)}>Start quiz</Button>
                                    </div>
                                    <Sparkles className="absolute -bottom-6 -right-6 w-24 h-24 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-colors" />
                                 </Card>
                              </motion.div>
                           ))}
                        </div>

                        {/* --- Pagination --- */}
                        {totalPages > 1 && (
                           <div className="flex justify-center items-center gap-2">
                              {[...Array(totalPages)].map((_, idx) => (
                                 <button key={idx} onClick={() => setPage(idx + 1)} className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${page === idx + 1 ? 'bg-slate-900 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>{idx + 1}</button>
                              ))}
                           </div>
                        )}
                     </motion.div>
                  )}
               </AnimatePresence>
            </section>
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

export default CategoryDetailPage;


