'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Activity,
  LayoutGrid,
  List,
  Table as TableIcon,
  Search,
  Target,
  Clock,
  Zap,
  Award,
  BookOpen,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { isMobile } from 'react-device-detect';
import { useSSR } from '../../../hooks/useSSR';
import Pagination from '../../Pagination';

const AdminUserQuizScores = ({ userId }) => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [quizScores, setQuizScores] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table');
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const fetchQuizScores = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20
      };

      const response = await API.getUserQuizBestScores(userId, params);
      if (response.success) {
        setQuizScores(response.data || []);
        setUser(response.user || null);
        setPagination(response.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setUser(null);
        setQuizScores([]);
      }
    } catch (error) {
      console.error('Error fetching quiz scores:', error);
      toast.error('Failed to fetch quiz scores');
      setQuizScores([]);
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    if (userId) {
      fetchQuizScores();
    }
  }, [userId, page, fetchQuizScores]);

  const getScoreBadge = (percentage) => {
    if (percentage >= 75) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (percentage >= 50) return 'bg-primary-500/10 text-primary-500 border-primary-500/20';
    return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  };

  const formatDate = (ds) => {
    if (!ds) return 'N/A';
    const d = new Date(ds);
    return `${d.getDate().toString().padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (ds) => {
    if (!ds) return 'N/A';
    return new Date(ds).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading) {
    return (
      <AdminMobileAppWrapper title="Academic Records">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-3 lg:p-8">
           <div className="relative">
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
               className="w-28 h-28 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full shadow-2xl"
             />
             <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-indigo-500" />
           </div>
           <div className="mt-4 lg:mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Retrieving Scholastic Integrity...</div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  if (!user) {
    return (
      <AdminMobileAppWrapper title="Academic Records">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-sans flex flex-col items-center justify-center p-3 lg:p-8">
           <div className="p-4 lg:p-10 bg-white dark:bg-white/5 rounded-xl lg:rounded-[3rem] shadow-xl border-b-8 border-slate-100 dark:border-white/5 mb-4 lg:mb-8">
             <Target className="w-16 h-16 text-slate-200 dark:text-slate-700" />
           </div>
           <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 italic">STUDENT NOT FOUND</h3>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 lg:mb-8">The student you are looking for does not exist.</p>
           <button
             onClick={() => router.push('/admin/students')}
             className="px-4 lg:px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
           >
             <ArrowLeft className="w-4 h-4" /> RETURN TO DIRECTORY
           </button>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Academic Records">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-sans text-slate-900 dark:text-white pb-20">
        {isMounted && <Sidebar />}
        <div className={`transition-all duration-500 ${isOpen ? 'lg:pl-80' : 'lg:pl-24'} p-4 lg:p-10 pt-16 lg:pt-10`}>
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 lg:mb-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4 lg:mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                     <Trophy className="w-6 h-6" />
                   </div>
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">SCHOLASTIC PERFORMANCE // AUDIT</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  QUIZ <span className="text-indigo-600">SCHEMATICS</span>
                </h1>
                <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 backdrop-blur-3xl w-fit">
                   <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">
                      {user.name?.[0].toUpperCase()}
                   </div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{user.name}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{user.email}</div>
                   </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                 <button
                   onClick={() => router.push('/admin/students')}
                   className="px-4 lg:px-8 py-4 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                 >
                   <ArrowLeft className="w-4 h-4 text-indigo-500" /> BACK TO DIRECTORY
                 </button>
              </div>
            </div>

            {/* Metric Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              {[
                { label: 'Cumulative Volume', value: pagination.total, icon: BookOpen, color: 'blue' },
                { label: 'Peak Performance', value: user?.monthlyProgress?.highScoreWins || 0, icon: Trophy, color: 'emerald' },
                { label: 'Precision Rating', value: `${user?.monthlyProgress?.accuracy || 0}%`, icon: Target, color: 'amber' },
                { label: 'Aggregated Score', value: user?.getScore || 0, icon: Activity, color: 'indigo' }
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="p-3 lg:p-8 bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 shadow-xl transition-all hover:scale-[1.02]"
                >
                  <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 w-fit mb-6 shadow-inner`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tabular-nums mb-2 tracking-tighter italic leading-none">{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Controller Bar */}
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-4 lg:mb-12 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                   <Zap className="w-5 h-5" />
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">DATA_FILTERING</div>
                   <div className="text-sm font-black italic uppercase tracking-tighter">Scholastic Results Index</div>
                </div>
             </div>

             <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-200 dark:border-white/10 shadow-inner">
                  {[
                    { icon: TableIcon, id: 'table', label: 'Tabular' },
                    { icon: List, id: 'list', label: 'Linear' },
                    { icon: LayoutGrid, id: 'grid', label: 'Spectral' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`p-4 rounded-full transition-all flex items-center gap-2 ${viewMode === mode.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <mode.icon className="w-4 h-4" />
                      {viewMode === mode.id && <span className="text-[10px] font-black uppercase tracking-widest pr-2">{mode.label}</span>}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <PieChart className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    className="pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-indigo-500/30 transition-all font-outfit"
                  >
                    <option>20 ITEMS PER_PAGE</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
             </div>
          </div>

          {/* Results Visualization */}
          <AnimatePresence mode="wait">
             {quizScores.length === 0 ? (
               <motion.div
                 key="empty"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-40 text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
               >
                 <div className="p-4 lg:p-10 bg-slate-100/50 dark:bg-white/5 rounded-xl lg:rounded-[3rem] mb-4 lg:mb-8 shadow-xl">
                   <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                 </div>
                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">ZERO_ENTRIES_LOCATED</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">This candidate has no recorded participation metrics for the specified term.</p>
               </motion.div>
             ) : (
               <motion.div
                 key="content"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-4 lg:space-y-12"
               >
                 {viewMode === 'table' && (
                   <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl">
                     <table className="w-full">
                       <thead>
                         <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left">
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">S.No.</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Module</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Optimum Score</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Precision %</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Benchmark</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Last Interaction</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                         {quizScores.map((score, i) => {
                           const percentage = score.bestScorePercentage || 0;
                           return (
                             <motion.tr
                               key={score.quizId || i}
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: i * 0.05 }}
                               className="group hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                             >
                               <td className="px-4 lg:px-8 py-3 lg:py-6 text-xs font-bold text-slate-400 tabular-nums">{((page - 1) * 20) + i + 1}</td>
                               <td className="px-4 lg:px-8 py-3 lg:py-6">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-110 transition-transform ${percentage >= 75 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-primary-500' : 'bg-rose-500'}`}>
                                        {score.quiz?.title?.[0].toUpperCase() || 'Q'}
                                     </div>
                                     <div>
                                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 group-hover:text-primary-500 transition-colors uppercase">{score.quiz?.title || 'Quiz ' + (((page - 1) * 20) + i + 1)}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{score.quiz?.category || 'SYSTEM_MODULE'}</div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                                  <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums italic">{score.bestScore || 0}</div>
                               </td>
                               <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                                  <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block border ${getScoreBadge(percentage)}`}>
                                     {percentage}%
                                  </div>
                               </td>
                               <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                                  {score.isHighScore ? (
                                    <div className="flex items-center justify-center gap-2 text-emerald-500 animate-pulse">
                                       <Award className="w-4 h-4" />
                                       <span className="text-[9px] font-black uppercase tracking-widest">RECORD_PEAK</span>
                                    </div>
                                  ) : (
                                    <div className="text-slate-300 dark:text-slate-600 text-[9px] font-black uppercase tracking-widest">SUB_PEAK</div>
                                  )}
                               </td>
                               <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                                  <div className="flex flex-col items-end">
                                     <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{formatDate(score.lastAttemptDate)}</div>
                                     <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatTime(score.lastAttemptDate)}</div>
                                  </div>
                               </td>
                             </motion.tr>
                           );
                         })}
                       </tbody>
                     </table>
                   </div>
                 )}

                 {viewMode === 'grid' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-8">
                      {quizScores.map((score, i) => {
                        const serialNumber = (page - 1) * 20 + i + 1;
                        const percentage = score.bestScorePercentage || 0;
                        return (
                          <motion.div
                            key={score.quizId || i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 hover:border-indigo-500/30 transition-all shadow-xl flex flex-col items-center text-center overflow-hidden"
                          >
                             <div className={`absolute top-0 left-0 w-full h-2 ${percentage >= 75 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-primary-500' : 'bg-rose-500'}`} />
                             
                             <div className="mt-4 mb-6 relative">
                               <div className={`w-20 h-20 rounded-lg lg:rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${percentage >= 75 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-primary-500' : 'bg-rose-500'}`}>
                                  {score.quiz?.title?.[0].toUpperCase() || 'Q'}
                               </div>
                               <div className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-white/10 shadow-lg">
                                  <span className="text-[10px] font-black">#{serialNumber}</span>
                               </div>
                             </div>

                             <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2 limit-text-1">
                               {score.quiz?.title || 'Quiz ' + serialNumber}
                             </h3>
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Module: {score.quiz?.category || 'General'}</div>

                             <div className="grid grid-cols-2 gap-4 w-full mb-4 lg:mb-8">
                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                   <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Score</div>
                                   <div className="text-sm font-black text-indigo-500 tabular-nums tracking-tighter italic">{score.bestScore || 0}</div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                   <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Precision</div>
                                   <div className={`text-sm font-black tabular-nums tracking-tighter italic ${percentage >= 75 ? 'text-emerald-500' : 'text-primary-500'}`}>{percentage}%</div>
                                </div>
                             </div>

                             <div className="w-full flex items-center justify-between pt-6 border-t-2 border-slate-50 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                   <Clock className="w-3 h-3 text-slate-400" />
                                   <span className="text-[9px] font-black uppercase text-slate-400">{formatDate(score.lastAttemptDate)}</span>
                                </div>
                                {score.isHighScore && (
                                  <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest">
                                     TOP_AUDIT
                                  </div>
                                )}
                             </div>
                          </motion.div>
                        );
                      })}
                   </div>
                 )}

                 {viewMode === 'list' && (
                    <div className="grid grid-cols-1 gap-3 lg:gap-6">
                       {quizScores.map((score, i) => {
                         const percentage = score.bestScorePercentage || 0;
                         return (
                           <motion.div
                             key={score.quizId || i}
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: i * 0.05 }}
                             className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 hover:border-primary-500/30 transition-all shadow-xl flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-8"
                           >
                              <div className={`w-20 h-20 rounded-lg lg:rounded-[2rem] flex items-center justify-center text-white text-xl lg:text-3xl font-black shadow-lg group-hover:scale-110 transition-transform shrink-0 ${percentage >= 75 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-primary-500' : 'bg-rose-500'}`}>
                                 {score.quiz?.title?.[0].toUpperCase() || 'Q'}
                              </div>
                              
                              <div className="flex-1 space-y-4">
                                 <div className="flex flex-wrap items-center gap-4">
                                    <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-primary-500 transition-colors uppercase whitespace-nowrap">{score.quiz?.title}</h3>
                                    <div className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10">{score.quiz?.category}</div>
                                 </div>
                                 <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                                     <div className="flex items-center gap-2">
                                       <Award className="w-4 h-4 text-emerald-500/50" />
                                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">RECORD_SCORE: {score.bestScore || 0}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <Target className="w-4 h-4 text-blue-500/50" />
                                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PRECISION: {percentage}%</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <Clock className="w-4 h-4 text-primary-500/50" />
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest uppercase tracking-widest italic">{formatDate(score.lastAttemptDate)} @ {formatTime(score.lastAttemptDate)}</span>
                                     </div>
                                 </div>
                              </div>

                              <div className="flex items-center gap-4 pl-0 lg:pl-10 lg:border-l-2 border-slate-100 dark:border-white/5">
                                 {score.isHighScore && (
                                   <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner animate-bounce">
                                      <Trophy className="w-6 h-6" />
                                   </div>
                                 )}
                              </div>
                           </motion.div>
                         );
                       })}
                    </div>
                 )}

                 {/* System-level Pagination */}
                 {pagination.totalPages > 1 && (
                   <div className="flex justify-center pt-12">
                     <Pagination
                       currentPage={page}
                       totalPages={pagination.totalPages}
                       onPageChange={setPage}
                       totalItems={pagination.total}
                       itemsPerPage={20}
                     />
                   </div>
                 )}
               </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminUserQuizScores;

