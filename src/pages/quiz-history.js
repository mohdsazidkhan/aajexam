'use client';

import React, { useState, useEffect } from 'react';
import {
   History,
   Search,
   Trophy,
   Brain,
   Target,
   Clock,
   Calendar,
   ChevronRight,
   Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import API from '../lib/api';
import MobileAppWrapper from '../components/MobileAppWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Loading from '../components/Loading';
import Seo from '../components/Seo';
import Pagination from '../components/Pagination';

const QuizHistoryPage = () => {
   const [history, setHistory] = useState([]);
   const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [searchTerm, setSearchTerm] = useState('');
   const [filter, setFilter] = useState('');
   const router = useRouter();

   const fetchHistory = async () => {
      try {
         setLoading(true);
         const params = { page: currentPage, limit: 12 };
         if (searchTerm) params.search = searchTerm;
         if (filter) params.status = filter;
         const res = await API.getStudentQuizHistory(params);
         const payload = res?.data || res;
         const items = payload?.attempts || payload?.history || payload?.quizzes || payload?.items || payload?.data || [];
         setHistory(Array.isArray(items) ? items : []);
         setTotalPages(payload?.pagination?.totalPages || payload?.totalPages || 1);
      } catch (e) {
         toast.error("Could not load quiz history");
      } finally { setLoading(false); }
   };

   useEffect(() => { fetchHistory(); }, [currentPage, filter]);

   const getRankBadge = (acc) => {
      if (acc >= 90) return { label: 'S', color: 'primary' };
      if (acc >= 75) return { label: 'A', color: 'secondary' };
      if (acc >= 50) return { label: 'B', color: 'blue' };
      return { label: 'C', color: 'slate' };
   };

   const handleView = (attempt) => {
      if (typeof window !== 'undefined') {
         sessionStorage.setItem('quizResult', JSON.stringify(attempt));
      }
      router.push("/quiz-result");
   };

   if (loading && history.length === 0) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><Loading size="md" /></div>;

   return (
      <MobileAppWrapper title="Quiz History">
         <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white mt-0">
            <Seo title="Quiz History - AajExam" noIndex={true} />

            <div className="container mx-auto px-2 lg:px-6 py-4 space-y-12 mt-0">
               <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="space-y-2 text-center lg:text-left">
                     <h1 className="text-2xl lg:text-5xl font-black font-outfit tracking-tight">Quiz History</h1>
                     <p className="text-sm font-bold text-gray-400">All the quizzes you have attempted</p>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center">
                     <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                           className="pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-primary-500"
                           placeholder="Search quizzes..."
                           value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
                        />
                     </div>
                     <select
                        className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black outline-none focus:border-primary-500"
                        value={filter} onChange={e => setFilter(e.target.value)}
                     >
                        <option value="">All</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                     </select>
                  </div>
               </div>

               {history.length === 0 ? (
                  <div className="py-32 text-center space-y-6">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto opacity-50"><Brain className="w-10 h-10 text-gray-400" /></div>
                     <h3 className="text-xl lg:text-2xl font-black font-outfit">No quizzes yet</h3>
                     <Button variant="secondary" onClick={() => router.push('/quizzes')}>Start a Quiz</Button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                     {history.map((attempt, idx) => {
                        const acc = attempt.percentage || attempt.scorePercentage || 0;
                        const rank = getRankBadge(acc);
                        const title = attempt.quizTitle || attempt.quiz?.title || 'Quiz';

                        return (
                           <motion.div key={attempt._id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                              <Card className="p-6 group cursor-pointer hover:shadow-2xl transition-all duration-500 border-2" onClick={() => handleView(attempt)}>
                                 <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                       <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                          <Brain className="w-6 h-6" />
                                       </div>
                                       <div className={`w-10 h-10 rounded-full border-4 border-${rank.color}-500/20 flex items-center justify-center text-${rank.color}-500 font-black font-outfit text-xl shadow-sm`}>
                                          {rank.label}
                                       </div>
                                    </div>

                                    <div className="space-y-1">
                                       <h4 className="text-lg font-black font-outfit tracking-tight line-clamp-1">{title}</h4>
                                       <p className="text-[10px] font-bold text-gray-400">{attempt.categoryName || 'General Knowledge'}</p>
                                    </div>

                                    <div className="space-y-4">
                                       <div className="flex justify-between items-end">
                                          <span className="text-[10px] font-black text-gray-400">Accuracy</span>
                                          <span className={`text-sm font-black text-${rank.color}-500`}>{acc.toFixed(0)}%</span>
                                       </div>
                                       <ProgressBar progress={acc} color={`${rank.color}-500`} height="h-2" shadow={rank.color === 'primary' ? 'shadow-duo-primary' : 'shadow-duo-secondary'} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t-2 border-slate-50 dark:border-slate-800">
                                       <div className="space-y-1">
                                          <span className="text-[8px] font-black text-gray-400">Score</span>
                                          <p className="text-sm font-black">{attempt.score} / {attempt.totalQuestions || 10}</p>
                                       </div>
                                       <div className="space-y-1">
                                          <span className="text-[8px] font-black text-gray-400">Streak</span>
                                          <div className="flex items-center gap-1 text-sm font-black text-orange-500"><Zap className="w-3 h-3 fill-current" /> {attempt.streak || 0}</div>
                                       </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[9px] font-black text-gray-400">
                                       <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(attempt.attemptedAt).toLocaleDateString()}</div>
                                       <div className="flex items-center gap-1.5 group-hover:text-primary-500 transition-colors">View Result <ChevronRight className="w-3 h-3" /></div>
                                    </div>
                                 </div>
                              </Card>
                           </motion.div>
                        );
                     })}
                  </div>
               )}

               {totalPages > 1 && (
                  <div className="flex justify-center pt-10">
                     <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
               )}
            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default QuizHistoryPage;
