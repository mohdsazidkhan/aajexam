'use client';

import React, { useState, useEffect } from 'react';
import {
   History, Search, Clock, Trophy, BrainCircuit, Eye, Calendar, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import API from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Loading from '../components/Loading';

const QuizHistoryPage = () => {
   const [attempts, setAttempts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [filter, setFilter] = useState('');
   const router = useRouter();

   const fetchHistory = async () => {
      try {
         setLoading(true);
         const res = await API.getMyQuizAttempts({ page: currentPage, limit: 12, status: filter || undefined });
         if (res?.success) {
            setAttempts(res.data || []);
            setTotalPages(res.pagination?.totalPages || 1);
         }
      } catch (e) {
         toast.error("Could not load quiz history");
      } finally { setLoading(false); }
   };

   useEffect(() => { fetchHistory(); }, [currentPage, filter]);

   const getRankBadge = (acc) => {
      if (acc >= 90) return { label: 'S', color: 'primary' };
      if (acc >= 75) return { label: 'A', color: 'emerald' };
      if (acc >= 50) return { label: 'B', color: 'blue' };
      return { label: 'C', color: 'slate' };
   };

   if (loading && attempts.length === 0) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

   return (
      <div className="min-h-screen pb-24">
         <Head><title>Quiz History - AajExam</title></Head>

         <div className="max-w-[1200px] mx-auto py-4 lg:py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
               <div className="space-y-1 text-center lg:text-left">
                  <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Quiz History</h1>
                  <p className="text-sm font-bold text-slate-400">All quizzes you have attempted</p>
               </div>
               <div className="flex gap-3">
                  <select
                     className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-primary-500"
                     value={filter} onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
                  >
                     <option value="">All</option>
                     <option value="Completed">Completed</option>
                     <option value="InProgress">In Progress</option>
                  </select>
               </div>
            </div>

            {/* Results */}
            {attempts.length === 0 ? (
               <div className="py-16 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                     <BrainCircuit className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-400">No quizzes attempted yet</h3>
                  <Button variant="primary" onClick={() => router.push('/quizzes')}>Start a Quiz</Button>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {attempts.map((attempt, idx) => {
                     const quiz = attempt.quiz;
                     const rank = getRankBadge(attempt.accuracy || 0);
                     const isCompleted = attempt.status === 'Completed';

                     return (
                        <motion.div key={attempt._id || idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                           <Card className="p-5 group hover:shadow-xl transition-all duration-300 border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500">
                              <div className="space-y-4">
                                 {/* Header */}
                                 <div className="flex justify-between items-start">
                                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                                       <BrainCircuit className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    {isCompleted && (
                                       <div className={`w-9 h-9 rounded-full border-4 border-${rank.color}-500/20 flex items-center justify-center text-${rank.color}-500 font-black text-lg`}>
                                          {rank.label}
                                       </div>
                                    )}
                                    {!isCompleted && (
                                       <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">In Progress</span>
                                    )}
                                 </div>

                                 {/* Title */}
                                 <div className="space-y-1">
                                    <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white line-clamp-1">{quiz?.title || 'Quiz'}</h4>
                                    <p className="text-[10px] font-bold text-slate-400">
                                       {quiz?.exam?.name || ''}{quiz?.subject?.name ? ` · ${quiz.subject.name}` : ''}{quiz?.topic?.name ? ` · ${quiz.topic.name}` : ''}
                                    </p>
                                 </div>

                                 {/* Stats */}
                                 {isCompleted && (
                                    <>
                                       <div className="space-y-2">
                                          <div className="flex justify-between items-end">
                                             <span className="text-[10px] font-black text-slate-400">Accuracy</span>
                                             <span className="text-sm font-black text-emerald-600">{Math.round(attempt.accuracy || 0)}%</span>
                                          </div>
                                          <ProgressBar progress={attempt.accuracy || 0} color="emerald" height="h-1.5" />
                                       </div>

                                       <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                          <div className="text-center">
                                             <span className="text-[9px] font-black text-slate-400 block">Score</span>
                                             <p className="text-sm font-black text-slate-900 dark:text-white">{Math.round(attempt.percentage || 0)}%</p>
                                          </div>
                                          <div className="text-center">
                                             <span className="text-[9px] font-black text-slate-400 block">Correct</span>
                                             <p className="text-sm font-black text-green-600">{attempt.correctCount}/{attempt.correctCount + attempt.wrongCount + (attempt.skippedCount || 0)}</p>
                                          </div>
                                          <div className="text-center">
                                             <span className="text-[9px] font-black text-slate-400 block">Rank</span>
                                             <p className="text-sm font-black text-primary-600">#{attempt.rank || '-'}</p>
                                          </div>
                                       </div>
                                    </>
                                 )}

                                 {/* Footer */}
                                 <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                       <Calendar className="w-3 h-3" />
                                       {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : new Date(attempt.createdAt).toLocaleDateString()}
                                    </div>
                                    {isCompleted ? (
                                       <button
                                          onClick={() => router.push(`/quiz-result/${attempt._id}`)}
                                          className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                                       >
                                          <Eye className="w-3 h-3" /> View Result
                                       </button>
                                    ) : (
                                       <button
                                          onClick={() => router.push(`/quiz/${quiz?._id}/attempt`)}
                                          className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg"
                                       >
                                          Resume
                                       </button>
                                    )}
                                 </div>
                              </div>
                           </Card>
                        </motion.div>
                     );
                  })}
               </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
               <div className="flex justify-center items-center gap-4 pt-6">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Prev</button>
                  <span className="text-sm font-bold text-slate-500">Page {currentPage} of {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Next</button>
               </div>
            )}
         </div>
      </div>
   );
};

export default QuizHistoryPage;
