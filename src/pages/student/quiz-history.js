'use client';

import Select from '../../components/common/ui/Select';
import PageHero from '@/components/common/ui/PageHero';
import { HistoryPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import React, { useState, useEffect } from 'react';
import {
   History, Search, Clock, Trophy, BrainCircuit, Eye, Calendar, Target
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import API from '../../lib/api';
import Card from '../../components/common/ui/Card';
import Button from '../../components/common/ui/Button';
import ProgressBar from '../../components/common/ui/ProgressBar';
import Loading from '../../components/common/Loading';
import SubscriptionGuard from '../../components/student/SubscriptionGuard';
import useTranslate from '../../hooks/useTranslate';
import Pagination from '../../components/common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../lib/constants/pagination';

const QuizHistoryPage = () => {
  const { translate, translateData } = useTranslate();
   const [attempts, setAttempts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);
   const [totalPages, setTotalPages] = useState(1);
   const [filter, setFilter] = useState('');
   const router = useRouter();

   const fetchHistory = async () => {
      try {
         setLoading(true);
         const res = await API.getMyQuizAttempts({ page: currentPage, limit: pageSize, status: filter || undefined });
         if (res?.success) {
            setAttempts(res.data || []);
            setTotalPages(res.pagination?.totalPages || 1);
         }
      } catch (e) {
         toast.error(translate('Could not load quiz history'));
      } finally { setLoading(false); }
   };

   // eslint-disable-next-line react-hooks/exhaustive-deps
   useEffect(() => { fetchHistory(); }, [currentPage, pageSize, filter]);

   const getRankBadge = (acc) => {
      if (acc >= 90) return { label: 'S', color: 'primary' };
      if (acc >= 75) return { label: 'A', color: 'primary' };
      if (acc >= 50) return { label: 'B', color: 'primary' };
      return { label: 'C', color: 'slate' };
   };

   if (loading && attempts.length === 0) return (
      <div className="min-h-screen bg-background-page pb-20 font-outfit selection:bg-primary-600 selection:text-white">
         <div className="py-2 xl:py-4"><HistoryPageSkeleton count={6} /></div>
      </div>
   );

   return (
      <div className="min-h-screen pb-6 xl:pb-12">
         <Head>
            <title>Quiz History - AajExam</title>
            {/* Private dashboard — never index, even if the robots.txt rule changes. */}
            <meta name="robots" content="noindex,nofollow" />
         </Head>

         <div className="container mx-auto py-4 xl:py-4 xl:py-8 space-y-3 xl:space-y-6">
            <SubscriptionGuard message="Upgrade to PRO to view your detailed quiz attempt history and performance insights.">
               <PageHero
                  icon={History}
                  eyebrow={translate('Quiz History')}
                  title={translate('Quiz History')}
                  actions={
                     <Select
                        className="px-4 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl text-xs font-bold outline-none focus:border-primary-700"
                        value={filter} onChange={e => { setFilter(e.target.value); setCurrentPage(1); }}
                     >
                        <option value="">{translate('All')}</option>
                        <option value="Completed">{translate('Completed')}</option>
                        <option value="InProgress">{translate('In Progress')}</option>
                     </Select>
                  }
               />

               {/* Results */}
               {attempts.length === 0 ? (
                  <div className="py-16 text-center space-y-2 xl:space-y-4">
                     <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                        <BrainCircuit className="w-10 h-10 text-slate-300" />
                     </div>
                     <h2 className="text-xl font-black text-slate-400">{translate('No quizzes attempted yet')}</h2>
                     <Button variant="primary" onClick={() => router.push('/quizzes')}>{translate('Start a Quiz')}</Button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
                     {attempts.map((attempt, idx) => {
                        const quiz = attempt.quiz;
                        const rank = getRankBadge(attempt.accuracy || 0);
                        const isCompleted = attempt.status === 'Completed';

                        return (
                           <motion.div key={attempt._id || idx} className="h-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                              <Card className="group h-full flex flex-col hover:shadow-sm transition-all duration-300 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-700">
                                 <div className="flex-1 flex flex-col gap-2 xl:gap-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                       <div className="p-2.5 bg-primary-50 dark:bg-primary-900/30 rounded-lg xl:rounded-xl">
                                          <BrainCircuit className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                                       </div>
                                       {isCompleted && (
                                          <div className={`w-9 h-9 rounded-full border-2 border-${rank.color}-500/20 flex items-center justify-center text-${rank.color}-500 font-black text-lg`}>
                                             {rank.label}
                                          </div>
                                       )}
                                       {!isCompleted && (
                                          <span className="text-[10px] font-bold text-black dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{translate('In Progress')}</span>
                                       )}
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-1">
                                       <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white line-clamp-1">{translateData(quiz?.title) || translate('Quiz')}</h3>
                                       <p className="text-[10px] font-bold text-slate-400">
                                          {quiz?.applicableExams?.map(e => e.name).join(', ') || ''}{quiz?.subject?.name ? ` · ${quiz.subject.name}` : ''}{quiz?.topic?.name ? ` · ${quiz.topic.name}` : ''}
                                       </p>
                                    </div>

                                    {/* Stats */}
                                    {isCompleted && (
                                       <>
                                          <div className="space-y-2">
                                             <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black text-slate-400">{translate('Accuracy')}</span>
                                                <span className="text-sm font-black text-primary-600 dark:text-primary-300">{Math.round(attempt.accuracy || 0)}%</span>
                                             </div>
                                             <ProgressBar progress={attempt.accuracy || 0} color="emerald" height="h-1.5" showPercentage={false} />
                                          </div>

                                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                             <div className="text-center">
                                                <span className="text-[9px] font-black text-slate-400 block">{translate('Score')}</span>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{Math.round(attempt.percentage || 0)}%</p>
                                             </div>
                                             <div className="text-center">
                                                <span className="text-[9px] font-black text-slate-400 block">{translate('Correct')}</span>
                                                <p className="text-sm font-black text-primary-600 dark:text-primary-300">{attempt.correctCount}/{attempt.correctCount + attempt.wrongCount + (attempt.skippedCount || 0)}</p>
                                             </div>
                                             <div className="text-center">
                                                <span className="text-[9px] font-black text-slate-400 block">{translate('Rank')}</span>
                                                <p className="text-sm font-black text-primary-600 dark:text-primary-300">#{attempt.rank || '-'}</p>
                                             </div>
                                          </div>
                                       </>
                                    )}

                                    {/* Footer */}
                                    <footer className="flex items-center justify-between pt-2 mt-auto">
                                       <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                          <Calendar className="w-3 h-3" />
                                          {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : new Date(attempt.createdAt).toLocaleDateString()}
                                       </div>
                                       {isCompleted ? (
                                          <button
                                             onClick={() => router.push(`/student/quiz-result/${attempt._id}`)}
                                             className="flex items-center gap-1 text-[10px] font-black text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                                          >
                                             <Eye className="w-3 h-3" /> View Result
                                          </button>
                                       ) : (
                                          <button
                                             onClick={() => router.push(`/quiz/${quiz?.slug}/attempt`)}
                                             className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg"
                                          >
                                             {translate('Resume')}
                                          </button>
                                       )}
                                    </footer>
                                 </div>
                              </Card>
                           </motion.div>
                        );
                     })}
                  </div>
               )}

               {/* Pagination */}
               <div className="pt-6"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setCurrentPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
            </SubscriptionGuard>
         </div>
      </div>
   );
};

export default QuizHistoryPage;
