'use client';

import Select from '../../components/common/ui/Select';
import PageHero from '@/components/common/ui/PageHero';
import { HistoryPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import React, { useState, useEffect } from 'react';
import { fmtNum } from '../../lib/utils/formatNumber';
import {
   History,
   Search,
   Filter,
   ArrowRight,
   Clock,
   Target,
   Trophy,
   GraduationCap,
   Eye,
   Calendar,
   XCircle,
   LayoutGrid,
   LayoutList
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/common/MobileAppWrapper';
import Card from '../../components/common/ui/Card';
import Button from '../../components/common/ui/Button';
import ProgressBar from '../../components/common/ui/ProgressBar';
import Loading from '../../components/common/Loading';
import Seo from '../../components/common/Seo';
import Pagination from '../../components/common/Pagination';
import SubscriptionGuard from '../../components/student/SubscriptionGuard';
import useTranslate from '../../hooks/useTranslate';

const ExamHistoryPage = () => {
  const { translate, translateData } = useTranslate();
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
         const res = await API.getExamAttemptHistory({ page: currentPage, limit: 12, search: searchTerm, status: filter });
         const payload = res?.data || res;
         setHistory(payload.attempts || payload.items || []);
         setTotalPages(payload.pagination?.totalPages || 1);
      } catch (e) {
         toast.error(translate('Could not load history'));
      } finally { setLoading(false); }
   };

   // eslint-disable-next-line react-hooks/exhaustive-deps
   useEffect(() => { fetchHistory(); }, [currentPage, filter]);

   const getRankBadge = (acc) => {
      if (acc >= 90) return { label: 'S', color: 'primary' };
      if (acc >= 75) return { label: 'A', color: 'primary' };
      if (acc >= 50) return { label: 'B', color: 'primary' };
      return { label: 'C', color: 'slate' };
   };

   if (loading && history.length === 0) return (
      <MobileAppWrapper title={translate('Exam History')}>
         <div className="py-2 xl:py-4"><HistoryPageSkeleton count={6} /></div>
      </MobileAppWrapper>
   );

   return (
      <MobileAppWrapper title={translate('Exam History')}>
         <div className="min-h-screen animate-fade-in selection:bg-primary-600 selection:text-white mt-0">
            <Seo title="Exam History - AajExam" noIndex={true} />

            <div className="py-4 py-6 xl:py-12 space-y-6 xl:space-y-12 mt-0">
               <SubscriptionGuard message="Upgrade to PRO to view your complete exam history and detailed performance analytics across all mock tests.">
                  <PageHero
                     icon={History}
                     eyebrow={translate('Exam History')}
                     title={translate('Exam History')}
                     actions={
                        <>
                        <div className="relative group">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-focus-within:text-primary-600 transition-colors" />
                           <input
                              className="pl-12 pr-4 py-3 border border-border-primary rounded-2xl text-xs font-bold outline-none focus:border-primary-700"
                              placeholder={translate('Search tests...')}
                              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
                           />
                        </div>
                        <Select
                           className="px-4 py-3 border border-border-primary rounded-2xl text-xs font-bold outline-none focus:border-primary-700"
                           value={filter} onChange={e => setFilter(e.target.value)}
                        >
                           <option value="">{translate('All')}</option>
                           <option value="Completed">{translate('Completed')}</option>
                           <option value="InProgress">{translate('In Progress')}</option>
                        </Select>
                        </>
                     }
                  />

                  {history.length === 0 ? (
                     <div className="py-4 xl:py-8 text-center space-y-3 xl:space-y-6">
                        <div className="w-24 h-24 bg-background-surface-secondary rounded-3xl flex items-center justify-center mx-auto opacity-50"><History className="w-10 h-10 text-content-muted" /></div>
                        <h2 className="text-xl xl:text-2xl font-bold font-outfit">{translate('No exams yet')}</h2>
                        <Button variant="primary" className='mx-auto' onClick={() => router.push('/govt-exams')}>{translate('Try Your First Exam')}</Button>
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-8">
                        {history.map((attempt, idx) => {
                           const rank = getRankBadge(attempt.accuracy || 0);
                           return (
                              <motion.div key={attempt._id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                                 <Card as="section" className="group cursor-pointer transition-all duration-500 border" onClick={() => router.push(`/govt-exams/test/${attempt.practiceTest}/result?attempt=${attempt._id}`)}>
                                    <div className="space-y-6">
                                       <div className="flex justify-between items-start">
                                          <div className="p-3 bg-background-surface-secondary rounded-2xl group-hover:bg-primary-700 group-hover:text-white transition-colors">
                                             <GraduationCap className="w-6 h-6" />
                                          </div>
                                          <div className={`w-10 h-10 rounded-full border border-${rank.color}-500/20 flex items-center justify-center text-${rank.color}-500 font-bold font-outfit text-xl`}>
                                             {rank.label}
                                          </div>
                                       </div>

                                       <div className="space-y-1">
                                          <h3 className="text-lg font-bold font-outfit tracking-tight line-clamp-1">{translateData(attempt.testTitle) || translate('Exam')}</h3>
                                          <p className="text-[10px] font-bold text-content-muted">{translateData(attempt.examName) || translate('Standard Exam')} • {translateData(attempt.patternTitle)}</p>
                                       </div>

                                       <div className="space-y-2 xl:space-y-4">
                                          <div className="flex justify-between items-end">
                                             <span className="text-[10px] font-bold text-content-muted">{translate('Accuracy')}</span>
                                             <span className={`text-sm font-bold text-${rank.color}-500`}>{attempt.accuracy?.toFixed(0)}%</span>
                                          </div>
                                          <ProgressBar progress={attempt.accuracy || 0} color={`${rank.color}-500`} height="h-2" />
                                       </div>

                                       <div className="grid grid-cols-2 gap-4 pt-2 border-t-2 border-border-primary dark:border-slate-800">
                                          <div className="space-y-1">
                                             <span className="text-[8px] font-bold text-content-muted">{translate('Score')}</span>
                                             <p className="text-sm font-bold">{fmtNum(attempt.score)} / {fmtNum(attempt.totalMarks)}</p>
                                          </div>
                                          <div className="space-y-1">
                                             <span className="text-[8px] font-bold text-content-muted">{translate('Rank')}</span>
                                             <p className="text-sm font-bold text-primary-600">#{attempt.rank || 'N/A'}</p>
                                          </div>
                                       </div>

                                       <div className="flex items-center justify-between text-[9px] font-bold text-content-muted">
                                          <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(attempt.submittedAt).toLocaleDateString()}</div>
                                          <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {Math.floor((attempt.totalTime || 0) / 60000)}m {(Math.floor((attempt.totalTime || 0) / 1000) % 60)}s</div>
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
               </SubscriptionGuard>
            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default ExamHistoryPage;
