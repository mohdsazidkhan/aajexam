'use client';

import React, { useState, useEffect } from 'react';
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

const ExamHistoryPage = () => {
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
         toast.error("Could not load history");
      } finally { setLoading(false); }
   };

   useEffect(() => { fetchHistory(); }, [currentPage, filter]);

   const getRankBadge = (acc) => {
      if (acc >= 90) return { label: 'S', color: 'primary' };
      if (acc >= 75) return { label: 'A', color: 'secondary' };
      if (acc >= 50) return { label: 'B', color: 'blue' };
      return { label: 'C', color: 'slate' };
   };

   if (loading && history.length === 0) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><Loading size="md" /></div>;

   return (
      <MobileAppWrapper title="Exam History">
         <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white mt-0">
            <Seo title="Exam History - AajExam" noIndex={true} />

            <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 space-y-6 lg:space-y-12 mt-0">
               <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="space-y-2 text-center lg:text-left">
                     <h1 className="text-2xl lg:text-5xl font-black font-outfit tracking-tight">Exam History</h1>
                     <p className="text-sm font-bold text-gray-400">All the exams you have attempted</p>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center">
                     <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                           className="pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-primary-500"
                           placeholder="Search tests..."
                           value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
                        />
                     </div>
                     <select
                        className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black outline-none focus:border-primary-500"
                        value={filter} onChange={e => setFilter(e.target.value)}
                     >
                        <option value="">All</option>
                        <option value="Completed">Completed</option>
                        <option value="InProgress">In Progress</option>
                     </select>
                  </div>
               </div>

               {history.length === 0 ? (
                  <div className="py-4 lg:py-8 text-center space-y-3 lg:space-y-6">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto opacity-50"><History className="w-10 h-10 text-gray-400" /></div>
                     <h3 className="text-xl lg:text-2xl font-black font-outfit">No exams yet</h3>
                     <Button variant="primary" className='mx-auto' onClick={() => router.push('/govt-exams')}>Try Your First Exam</Button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                     {history.map((attempt, idx) => {
                        const rank = getRankBadge(attempt.accuracy || 0);
                        return (
                           <motion.div key={attempt._id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                              <Card className="p-6 group cursor-pointer hover:shadow-2xl transition-all duration-500 border-2" onClick={() => router.push(`/govt-exams/test/${attempt.practiceTest}/result?attempt=${attempt._id}`)}>
                                 <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                       <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                          <GraduationCap className="w-6 h-6" />
                                       </div>
                                       <div className={`w-10 h-10 rounded-full border-4 border-${rank.color}-500/20 flex items-center justify-center text-${rank.color}-500 font-black font-outfit text-xl shadow-sm`}>
                                          {rank.label}
                                       </div>
                                    </div>

                                    <div className="space-y-1">
                                       <h4 className="text-lg font-black font-outfit tracking-tight line-clamp-1">{attempt.testTitle || 'Exam'}</h4>
                                       <p className="text-[10px] font-bold text-gray-400">{attempt.examName || 'Standard Exam'} • {attempt.patternTitle}</p>
                                    </div>

                                    <div className="space-y-4">
                                       <div className="flex justify-between items-end">
                                          <span className="text-[10px] font-black text-gray-400">Accuracy</span>
                                          <span className={`text-sm font-black text-${rank.color}-500`}>{attempt.accuracy?.toFixed(0)}%</span>
                                       </div>
                                       <ProgressBar progress={attempt.accuracy || 0} color={`${rank.color}-500`} height="h-2" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t-2 border-slate-50 dark:border-slate-800">
                                       <div className="space-y-1">
                                          <span className="text-[8px] font-black text-gray-400">Score</span>
                                          <p className="text-sm font-black">{attempt.score} / {attempt.totalMarks}</p>
                                       </div>
                                       <div className="space-y-1">
                                          <span className="text-[8px] font-black text-gray-400">Rank</span>
                                          <p className="text-sm font-black text-primary-500">#{attempt.rank || 'N/A'}</p>
                                       </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[9px] font-black text-gray-400">
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
            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default ExamHistoryPage;
