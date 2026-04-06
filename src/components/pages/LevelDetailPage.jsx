'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
   Trophy,
   Crown,
   Star,
   Rocket,
   Brain,
   TrendingUp,
   ArrowLeft,
   Clock,
   HelpCircle,
   Layers,
   UserPlus,
   Award,
   Gem,
   Wand2,
   Medal,
   Target,
   ShieldCheck,
   Zap,
   Sparkles,
   ChevronRight,
   ArrowRight,
   Layout,
   ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../lib/api';
import QuizStartModal from '../QuizStartModal';
import MonthlyRewardsInfo from '../MonthlyRewardsInfo';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import Card from '../ui/Card';
import Button from '../ui/Button';

const LEVEL_VISUALS = {
   'Starter': { icon: UserPlus, color: 'slate' },
   'Rookie': { icon: Star, color: 'blue' },
   'Explorer': { icon: Rocket, color: 'indigo' },
   'Thinker': { icon: Brain, color: 'violet' },
   'Strategist': { icon: Layout, color: 'purple' },
   'Achiever': { icon: Award, color: 'emerald' },
   'Mastermind': { icon: Gem, color: 'pink' },
   'Champion': { icon: Trophy, color: 'amber' },
   'Prodigy': { icon: Medal, color: 'amber' },
   'Wizard': { icon: Wand2, color: 'cyan' },
   'Legend': { icon: Crown, color: 'primary' },
   'Default': { icon: Sparkles, color: 'slate' }
};

const LevelDetailPage = () => {
   const router = useRouter();
   const { levelNumber } = router.query;
   const [levelInfo, setLevelInfo] = useState(null);
   const [quizzes, setQuizzes] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);
   const [showQuizModal, setShowQuizModal] = useState(false);
   const [selectedQuiz, setSelectedQuiz] = useState(null);

   const fetchLevelDetails = useCallback(async () => {
      try {
         setLoading(true);
         const res = await API.getPublicLevels();
         if (res.success) {
            const currentLevel = res.data.find(lvl => lvl.levelNumber === Number(levelNumber));
            if (currentLevel) {
               setLevelInfo(currentLevel);
            } else {
               setError('Level not found');
            }
         } else {
            setError('Failed to sync level data');
         }
      } catch (err) {
         setError('Connection lost. Please check your internet.');
      } finally {
         setLoading(false);
      }
   }, [levelNumber]);

   const fetchQuizzes = useCallback(async (pageNum = 1, append = false) => {
      if (!levelNumber) return;
      try {
         const res = await API.getLevelBasedQuizzes({ level: levelNumber, page: pageNum, limit: 12 });
         if (res.success) {
            if (append) setQuizzes(prev => [...prev, ...res.data]);
            else setQuizzes(res.data);
            setHasMore(res.pagination?.hasNextPage || false);
         }
      } catch (err) {
         console.error('Failed to load quizzes for this level.');
      }
   }, [levelNumber]);

   useEffect(() => {
      if (levelNumber !== undefined) {
         fetchLevelDetails();
         fetchQuizzes(1, false);
      }
   }, [levelNumber, fetchLevelDetails, fetchQuizzes]);

   const loadMoreQuizzes = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchQuizzes(nextPage, true);
   };

   const handleQuizClick = (quiz) => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
         router.push('/login');
         return;
      }
      setSelectedQuiz(quiz);
      setShowQuizModal(true);
   };

   const handleConfirmQuizStart = (competitionType) => {
      setShowQuizModal(false);
      if (selectedQuiz) {
         localStorage.setItem('quizNavigationData', JSON.stringify({
            fromPage: 'level-detail',
            levelNumber: levelNumber,
            quizData: selectedQuiz,
            competitionType,
         }));
         router.push(`/attempt-quiz/${selectedQuiz._id}`);
      }
   };

   if (loading && !levelInfo) return <div className="min-h-screen flex items-center justify-center bg-slate-900 font-outfit"><Loading size="lg" /></div>;

   const visual = LEVEL_VISUALS[levelInfo?.name] || LEVEL_VISUALS.Default;

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white font-outfit">

         <div className="container mx-auto px-2 lg:px-6 py-4 lg:py-12 space-y-5 lg:space-y-16">

            {/* --- Navigation Bar --- */}
            <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-3 lg:p-4 rounded-[1.5rem] lg:rounded-[2rem] shadow-xl border-2 border-slate-50 dark:border-slate-800">
               <Button variant="ghost" onClick={() => router.push('/home')} className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary-700 dark:text-primary-500 transition-all font-outfit">
                  <ArrowLeft className="w-4 h-4 mr-2" /> BACK TO LEVELS
               </Button>
               <div className="flex items-center gap-4 pr-4">
                  <div className="w-10 h-10 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-xl flex items-center justify-center border-2 border-primary-500/10 shadow-inner">
                     <Target className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">LEVEL STATUS</p>
                     <h2 className="text-sm font-black font-outfit uppercase">{levelInfo?.name || 'SYNCING...'}</h2>
                  </div>
               </div>
            </div>

            {/* --- Header Section --- */}
            <section className="relative py-10 lg:py-20 text-center space-y-6 lg:space-y-10 overflow-hidden rounded-[2rem] lg:rounded-[4rem] bg-white dark:bg-slate-800 border-b-4 lg:border-b-8 border-slate-100 dark:border-slate-800 shadow-2xl">
               <div className="relative z-10 space-y-5 lg:space-y-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-20 lg:w-32 h-20 lg:h-32 bg-${visual.color === 'primary' ? 'primary' : visual.color}-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-duo-${visual.color === 'primary' ? 'primary' : visual.color} border-4 border-white/10`}>
                     <visual.icon className="w-8 lg:w-16 h-8 lg:h-16 text-white" />
                  </motion.div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-[0.4em]">YOUR LEVEL</p>
                     <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight leading-none text-slate-900 dark:text-white">Level <span className="text-primary-700 dark:text-primary-500">{levelNumber}</span> Overview</h1>
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed px-6">{levelInfo?.description}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 lg:px-10 relative z-10 max-w-5xl mx-auto pt-6 lg:pt-10">
                  {[
                     { label: 'QUIZZES NEEDED', val: levelInfo?.quizzesRequired, sub: 'QUIZZES', color: 'primary', icon: ListOrdered },
                     { label: 'PLAN NEEDED', val: levelInfo?.requiredSubscription || 'FREE', sub: 'MEMBERSHIP', color: 'emerald', icon: ShieldCheck },
                     { label: 'SCORE BONUS', val: '1.2x', sub: 'EXTRA POINTS', color: 'amber', icon: Zap },
                     { label: 'PRICE', val: '₹0', sub: 'FEE', color: 'blue', icon: Gem }
                  ].map((s, i) => (
                     <div key={i} className="p-4 lg:p-6 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] lg:rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 space-y-1 lg:space-y-2 group hover:border-primary-500/30 transition-all">
                        <div className={`p-3 bg-${s.color}-500/10 text-${s.color}-500 rounded-xl w-fit mx-auto mb-2 border-2 border-${s.color}-500/5`}>
                           <s.icon className="w-4 h-4" />
                        </div>
                        <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                        <h4 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white leading-none">{s.val}</h4>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none pt-2">{s.sub}</p>
                     </div>
                  ))}
               </div>
               <Sparkles className="absolute -bottom-24 -right-24 w-96 h-96 text-primary-700 dark:text-primary-500/5" />
            </section>

            {/* --- Quiz List --- */}
            <section className="space-y-10">
               <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b-2 border-slate-100 dark:border-slate-800 pb-8 px-4">
                  <div className="space-y-1 text-center lg:text-left">
                     <h2 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight flex items-center gap-4">
                        <ListOrdered className="text-primary-700 dark:text-primary-500 w-8 h-8" /> Required <span className="text-primary-700 dark:text-primary-500">Quizzes</span>
                     </h2>
                     <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Pick a quiz and start practicing to reach the next level.</p>
                  </div>
               </div>

               <AnimatePresence mode="wait">
                  {quizzes.length === 0 && !loading ? (
                     <Card className="py-24 text-center space-y-6 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent rounded-[3rem]">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto opacity-50">
                           <Layers className="w-10 h-10 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">No Quizzes Found</h3>
                           <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">No quizzes have been added to this level yet.</p>
                        </div>
                     </Card>
                  ) : (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                        {quizzes.map((quiz, idx) => (
                           <motion.div key={quiz._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                              <Card className="p-4 lg:p-8 h-full flex flex-col justify-between group border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2rem] lg:rounded-[3rem] shadow-xl">
                                 <div className="space-y-4 lg:space-y-8">
                                    <div className="flex justify-between items-start">
                                       <div className="p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm border-2 border-primary-500/5">
                                          <Trophy className="w-6 h-6" />
                                       </div>
                                       <div className="flex flex-col items-end gap-2">
                                          <span className="bg-slate-900 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">QUIZ {idx + 1}</span>
                                          <span className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-600">{quiz.category?.name || 'GENERAL'}</span>
                                       </div>
                                    </div>

                                    <div className="space-y-3">
                                       <h3 className="text-xl font-black font-outfit uppercase leading-tight group-hover:text-primary-700 dark:text-primary-500 transition-colors line-clamp-2">{quiz.title}</h3>
                                       <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide line-clamp-2 leading-relaxed">{quiz.description || 'Practice this quiz to test your knowledge and advance to the next level.'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                       <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                                          <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-2">TIME LIMIT</p>
                                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center gap-2 font-outfit"><Clock className="w-3 h-3" /> {quiz.timeLimit}m</p>
                                       </div>
                                       <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                                          <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-2">TOTAL QUESTIONS</p>
                                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center gap-2 font-outfit"><HelpCircle className="w-3 h-3" /> {quiz.totalMarks} Qs</p>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="pt-4 lg:pt-10">
                                    <Button variant="primary" fullWidth className="py-4 lg:py-5 text-[10px] font-black uppercase tracking-widest shadow-duo-primary group-hover:scale-[1.02] transition-all font-outfit" onClick={() => handleQuizClick(quiz)}>
                                       <Zap className="w-4 h-4 mr-2" /> START QUIZ
                                    </Button>
                                 </div>

                                 <Sparkles className="absolute -bottom-6 -right-6 w-24 h-24 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-colors pointer-events-none" />
                              </Card>
                           </motion.div>
                        ))}
                     </div>
                  )}
               </AnimatePresence>

               {/* --- Load More --- */}
               {hasMore && (
                  <div className="pt-12 text-center">
                     <Button onClick={loadMoreQuizzes} disabled={loading} variant="ghost" className="px-12 py-5 rounded-[2rem] bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-xl hover:text-primary-700 dark:text-primary-500 transition-all border-2 border-slate-100 dark:border-slate-700 font-outfit">
                        {loading ? 'LOADING...' : 'LOAD MORE QUIZZES'} <ArrowRight className="w-4 h-4 ml-4" />
                     </Button>
                  </div>
               )}
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

export default LevelDetailPage;

