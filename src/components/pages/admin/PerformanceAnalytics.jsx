'use client';

import config from '../../../lib/config/appConfig';
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Bar } from "react-chartjs-2";
import { useGlobalError } from "../../../contexts/GlobalErrorContext";
import { useTokenValidation } from "../../../hooks/useTokenValidation";
import { useSSR } from '../../../hooks/useSSR';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement,
} from "chart.js";
import {
  Download, Filter, BarChart3, Users, Award, Target, Zap, Activity, RefreshCcw, Cpu, Globe,
  ArrowRight, ArrowUpRight, ArrowDownRight, Layers, LayoutGrid, List, Table as TableIcon,
  Calendar, TrendingUp, ShieldCheck, Mail, ChevronRight, ExternalLink, Wallet, PieChart, Star, Trophy, Medal,
  MousePointer2, ZapOff, CheckCircle2, AlertCircle, Info, DownloadCloud
} from 'lucide-react';
import { useSelector } from "react-redux";
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Sidebar from '../../Sidebar';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement
);

const exportCSV = (data, filename) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const PerformanceAnalytics = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table');
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ period: "month" });
  const [activeTab, setActiveTab] = useState('monthly');
  const [topPerformers, setTopPerformers] = useState([]);
  const [topPerformersLoading, setTopPerformersLoading] = useState(false);

  const { checkRateLimitError } = useGlobalError();
  const { validateTokenBeforeRequest } = useTokenValidation();

  useEffect(() => {
    if (!validateTokenBeforeRequest()) return;
    setLoading(true);
    API.getPerformanceAnalytics({ ...filters, limit: config.QUIZ_CONFIG.ADMIN_TOP_PERFORMERS_USERS })
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.message || "Failed to load data. Please try again.");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load data. Please try again.");
        setLoading(false);
      });
  }, [filters, validateTokenBeforeRequest]);

  useEffect(() => {
    if (!validateTokenBeforeRequest()) return;
    setTopPerformersLoading(true);
    API.getAdminTopPerformers({ type: activeTab, limit: config.QUIZ_CONFIG.ADMIN_TOP_PERFORMERS_USERS })
      .then((res) => {
        if (res.success) setTopPerformers(res.data);
        setTopPerformersLoading(false);
      })
      .catch(() => setTopPerformersLoading(false));
  }, [activeTab, validateTokenBeforeRequest]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const getSortedTopPerformers = () => {
    let list = [...(topPerformers || [])];
    if (filters.sortBy === 'highScores') list.sort((a, b) => (b.level?.highScoreQuizzes || 0) - (a.level?.highScoreQuizzes || 0));
    else if (filters.sortBy === 'avgScore') list.sort((a, b) => (b.level?.accuracy || 0) - (a.level?.accuracy || 0));
    else if (filters.sortBy === 'quizzesPlayed') list.sort((a, b) => (b.level?.quizzesPlayed || 0) - (a.level?.quizzesPlayed || 0));
    return list;
  };

  const handleExport = () => {
    if (!data?.topPerformers?.length) return;
    const rows = data.topPerformers.map(p => ({
      Name: p.name, Level: p.level?.currentLevel, Wins: p.monthlyProgress?.highScoreWins, Accuracy: p.monthlyProgress?.accuracy
    }));
    exportCSV(rows, "performance_report.csv");
  };

  if (!isMounted) return null;

  const isDark = typeof window !== 'undefined' ? document.documentElement.classList.contains("dark") : false;
  const chartTextColor = isDark ? "#A0AEC0" : "#4A5568";
  
  const levelLabels = data?.levelPerformance?.map(l => `Level ${l._id}`) || [];
  const levelScores = data?.levelPerformance?.map(l => l.avgScore) || [];
  const levelUsers = data?.levelPerformance?.map(l => l.userCount) || [];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: chartTextColor, font: { family: 'Outfit', size: 10 } } },
      y: { grid: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }, ticks: { color: chartTextColor, font: { family: 'Outfit', size: 10 } } }
    }
  };

  return (
    <AdminMobileAppWrapper title="Performance Analytics">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
              <div className="space-y-4">
                
                 <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                   Performance Analytics
                 </h1>
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                   Track student performance, scores, and progression over time.
                 </p>
              </div>

              <div className="grid grid-cols-1 lg:flex lg:items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center bg-white dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/10 shadow-xl w-full lg:w-auto">
                  {[{ icon: TableIcon, id: 'table' }, { icon: List, id: 'list' }, { icon: LayoutGrid, id: 'grid' }].map((mode) => (
                    <button key={mode.id} onClick={() => setViewMode(mode.id)} className={`p-3 rounded-full transition-all flex-1 lg:flex-none ${viewMode === mode.id ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400'}`}>
                      <mode.icon className="w-5 h-5 mx-auto" />
                    </button>
                  ))}
                </div>
                <div className="relative group w-full lg:w-auto">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select name="period" value={filters.period} onChange={handleFilterChange} className="w-full lg:w-auto pl-12 pr-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer shadow-2xl">
                    <option value="week">Past 7 Days</option>
                    <option value="month">Past 30 Days</option>
                    <option value="quarter">Past 90 Days</option>
                    <option value="year">Full Year</option>
                  </select>
                </div>
                <motion.button onClick={handleExport} whileHover={{ scale: 1.05 }} className="w-full lg:w-auto p-4 bg-white dark:bg-white/5 text-primary-500 rounded-2xl border-2 border-slate-100 dark:border-white/10 shadow-lg flex items-center justify-center"><DownloadCloud className="w-6 h-6" /></motion.button>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-3 lg:space-y-6">
                <Loading size="md" color="blue" message="Loading performance data..." />
              </div>
            ) : error ? (
               <div className="text-center py-32 bg-rose-500/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-rose-500/10">
                 <ZapOff className="w-20 h-20 text-rose-300 mx-auto mb-4 lg:mb-8 opacity-40" />
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-4 tracking-tighter">Failed to load data</h3>
                 <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                 <button onClick={() => window.location.reload()} className="mt-4 lg:mt-8 px-4 lg:px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest">Try Again</button>
               </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 lg:space-y-12">
                  
                  {/* Visual Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
                     {[
                       { title: 'Level Success Rate', data: levelScores, color: 'rgba(99, 102, 241, 0.8)' },
                       { title: 'User Distribution', data: levelUsers, color: 'rgba(139, 92, 246, 0.8)' }
                     ].map((chart, i) => (
                       <div key={i} className="bg-white dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl relative group">
                          <div className="flex items-center justify-between mb-4 lg:mb-8">
                             <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{chart.title}</h3>
                             <Activity className="w-5 h-5 text-primary-500 opacity-30" />
                          </div>
                          <div className="h-64">
                             <Bar data={{ 
                               labels: levelLabels, 
                               datasets: [{ data: chart.data, backgroundColor: chart.color, borderRadius: 12, borderWidth: 0 }] 
                             }} options={chartOptions} />
                          </div>
                       </div>
                     ))}
                  </div>

                  {/* Summary Spotlight */}
                  <div className="bg-slate-900 dark:bg-white rounded-2xl lg:rounded-[4rem] p-4 lg:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
                     <div className="relative z-10 space-y-3 lg:space-y-6 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                           <div className="p-3 bg-primary-500 text-white rounded-2xl"><Award className="w-8 h-8" /></div>
                           <h2 className="text-3xl lg:text-4xl font-black text-white dark:text-slate-900 uppercase italic tracking-tighter leading-none">Top Performers <span className="text-primary-500 block">Leaderboard</span></h2>
                        </div>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 lg:gap-6">
                           {[
                            { l: 'Daily Accomplishments', v: '1,240', c: 'text-rose-400' },
                            { l: 'Weekly Highlights', v: '8,500', c: 'text-indigo-400' },
                            { l: 'Total Activities', v: '42,000', c: 'text-emerald-400' }
                           ].map((s, i) => (
                             <div key={i} className="text-center lg:text-left border-l-2 border-white/10 dark:border-slate-200 pl-6">
                                <div className={`text-2xl font-black ${s.c} tabular-nums`}>{s.v}</div>
                                <div className="text-[9px] font-black text-white/40 dark:text-slate-400 uppercase tracking-widest">{s.l}</div>
                             </div>
                           ))}
                        </div>
                     </div>
                     {getSortedTopPerformers().length > 0 && (
                       <motion.div whileHover={{ scale: 1.05 }} className="bg-white/10 dark:bg-slate-900/10 backdrop-blur-3xl p-3 lg:p-8 rounded-xl lg:rounded-[3rem] border-2 border-white/20 dark:border-slate-900/20 text-center lg:text-left min-w-[320px]">
                          <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-4">Top Contributor</div>
                          <div className="flex items-center gap-3 lg:gap-6 mb-6">
                             <div className="w-16 h-16 bg-primary-500 text-white rounded-3xl flex items-center justify-center text-3xl font-black italic shadow-xl">{(getSortedTopPerformers()[0]?.name || 'U')[0]}</div>
                             <div>
                                <div className="text-xl font-black text-white dark:text-slate-900 uppercase italic tracking-tighter leading-none mb-1">{getSortedTopPerformers()[0]?.name}</div>
                                <div className="text-[10px] font-black text-white/50 dark:text-slate-500 uppercase tracking-widest">Level {getSortedTopPerformers()[0]?.level?.currentLevel} // {getSortedTopPerformers()[0]?.level?.accuracy}% ACC</div>
                             </div>
                          </div>
                          <div className="flex items-center justify-between pt-6 border-t border-white/10 dark:border-slate-900/10">
                             <div className="text-3xl font-black text-white dark:text-slate-900 tabular-nums italic tracking-tighter">{getSortedTopPerformers()[0]?.level?.highScoreQuizzes || 0} <span className="text-xs uppercase not-italic opacity-40 ml-1">Wins</span></div>
                             <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
                          </div>
                       </motion.div>
                     )}
                     <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-500/20 blur-[120px]" />
                  </div>

                  {/* Rankings / Listings */}
                  <div className="space-y-4 lg:space-y-8">
                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8 mb-4 lg:mb-8">
                        <div className="flex items-center bg-white dark:bg-white/5 p-2 rounded-xl lg:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 shadow-xl overflow-hidden">
                          {['daily', 'weekly', 'monthly'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 lg:px-8 py-3 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-primary-500 text-white shadow-xl' : 'text-slate-400'}`}>{t}</button>
                          ))}
                        </div>
                         <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/10 shadow-xl">
                            <div className="pl-6 pr-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Sort By</div>
                           <select name="sortBy" value={filters.sortBy || 'highScores'} onChange={handleFilterChange} className="px-3 lg:px-6 py-3 bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer">
                              <option value="highScores">High Scores</option>
                              <option value="avgScore">Accuracy</option>
                              <option value="quizzesPlayed">Engagement</option>
                           </select>
                        </div>
                     </div>

                     {viewMode === 'table' ? (
                       <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                          <table className="w-full border-collapse">
                             <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Rank</th>
                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                                   <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Level</th>
                                   <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Accuracy</th>
                                   <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Engagement</th>
                                   <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Score</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {getSortedTopPerformers().map((p, idx) => (
                                  <motion.tr key={p._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} className="group hover:bg-primary-500/5 transition-all cursor-pointer">
                                     <td className="px-4 lg:px-8 py-3 lg:py-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic text-sm ${idx < 3 ? 'bg-amber-500 text-white shadow-xl' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>{idx + 1}</div>
                                     </td>
                                     <td className="px-4 lg:px-8 py-3 lg:py-6">
                                        <div className="flex items-center gap-4">
                                           <div className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-black text-sm uppercase shadow-lg">{(p.name || 'U')[0]}</div>
                                           <div>
                                              <div className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1 group-hover:text-primary-500 transition-colors uppercase tracking-tight">{p.name || 'Anonymous'}</div>
                                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{p.email || 'N/A'}</div>
                                           </div>
                                        </div>
                                     </td>
                                     <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                                        <div className="text-xs font-black text-primary-500 uppercase tracking-widest mb-1">Level {p.level?.currentLevel}</div>
                                        <div className={`px-3 py-0.5 rounded-lg text-[8px] font-black uppercase inline-block ${p.subscriptionStatus === 'pro' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}`}>{p.subscriptionStatus}</div>
                                     </td>
                                     <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                                        <div className={`text-lg font-black tabular-nums tracking-tighter ${p.level?.accuracy >= 80 ? 'text-emerald-500' : 'text-primary-500'}`}>{p.level?.accuracy}%</div>
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Accuracy</div>
                                     </td>
                                     <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                                        <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{p.level?.quizzesPlayed || 0}</div>
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quizzes</div>
                                     </td>
                                     <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                                        <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic">{p.level?.totalScore?.toFixed(2) || "0.00"}</div>
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Net Points</div>
                                     </td>
                                  </motion.tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                     ) : viewMode === 'grid' ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                          {getSortedTopPerformers().map((p, idx) => (
                            <motion.div key={p._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl relative flex flex-col group overflow-hidden">
                               <div className={`absolute top-0 left-0 w-full h-1.5 ${idx < 3 ? 'bg-amber-400' : 'bg-primary-500'}`} />
                               <div className="flex justify-between items-start mb-4 lg:mb-8">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-xs ${idx < 3 ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>{idx + 1}</div>
                                  <div className="flex flex-col items-end">
                                     <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Level {p.level?.currentLevel}</div>
                                     <div className={`text-[8px] font-black uppercase opacity-40`}>{p.subscriptionStatus}</div>
                                  </div>
                               </div>
                               <div className="mb-6 mx-auto">
                                  <div className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-xl group-hover:rotate-6 transition-all">{(p.name || 'U')[0]}</div>
                               </div>
                               <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 text-center truncate">{p.name || 'Anonymous'}</h3>
                               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-4 lg:mb-8 truncate">{p.email || 'N/A'}</div>
                               <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/5 mt-auto">
                                  <div className="flex justify-between items-center mb-4">
                                     <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Accuracy</div>
                                     <div className="text-md font-black text-emerald-500 tabular-nums">{p.level?.accuracy}%</div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                     <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">High Scores</div>
                                     <div className="text-md font-black text-primary-500 tabular-nums">{p.level?.highScoreQuizzes || 0}</div>
                                  </div>
                               </div>
                            </motion.div>
                          ))}
                       </div>
                     ) : (
                       <div className="space-y-3 lg:space-y-6">
                          {getSortedTopPerformers().map((p, idx) => (
                            <motion.div key={p._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6 hover:border-primary-500/30 transition-all font-outfit shadow-xl group">
                               <div className="flex items-center gap-3 lg:gap-6">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black italic shadow-xl shrink-0 ${idx < 3 ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'}`}>{idx + 1}</div>
                                  <div>
                                     <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 group-hover:text-primary-500 transition-colors uppercase">{p.name || 'User'}</h3>
                                     <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.email || 'N/A'}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border border-primary-500/20 text-primary-500`}>Level {p.level?.currentLevel}</span>
                                     </div>
                                  </div>
                               </div>
                               <div className="flex flex-wrap items-center gap-3 lg:gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                                  {[
                                    { l: 'Accuracy', v: `${p.level?.accuracy}%`, c: 'text-emerald-500' },
                                    { l: 'Engagement', v: p.level?.quizzesPlayed, c: 'text-indigo-500' },
                                    { l: 'Net Score', v: p.level?.totalScore?.toFixed(0), c: 'text-primary-500' }
                                  ].map((s, i) => (
                                    <div key={i} className="text-center md:text-right min-w-[80px]">
                                       <div className={`text-lg font-black ${s.c} tabular-nums tracking-tighter`}>{s.v}</div>
                                       <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.l}</div>
                                    </div>
                                  ))}
                                  <motion.button whileHover={{ scale: 1.1 }} className="p-4 bg-slate-100 dark:bg-white/5 text-primary-500 rounded-2xl shadow-md"><ChevronRight className="w-5 h-5" /></motion.button>
                               </div>
                            </motion.div>
                          ))}
                       </div>
                     )}
                  </div>

                  {/* Sub-Category Deep Dive */}
                  <div className="space-y-4 lg:space-y-8 pt-12 border-t border-slate-100 dark:border-white/5">
                     <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 text-purple-500 rounded-2xl"><PieChart className="w-6 h-6" /></div>
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em]">Analysis // Success Rate by Category</span>
                           </div>
                           <h2 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">Category Performance</h2>
                           <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Quiz attempt volume and scores by exam category.</p>
                        </div>
                        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl lg:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 shadow-xl flex items-center gap-3 lg:gap-6">
                           <div className="border-r border-slate-100 dark:border-white/10 pr-6">
                              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Categories</div>
                              <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{data?.categoryPerformance?.length || 0}</div>
                           </div>
                           <div>
                              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Attempts</div>
                              <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{data?.categoryPerformance?.reduce((s, c) => s + (c.attemptCount || 0), 0).toLocaleString() || 0}</div>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                        <table className="w-full border-collapse">
                           <thead>
                              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                                 <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">ID</th>
                                 <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Category</th>
                                 <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Attempt Count</th>
                                 <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Avg Accuracy</th>
                                 <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Completion Rate</th>
                                 <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {(data?.categoryPerformance || []).sort((a,b) => b.attemptCount - a.attemptCount).map((cat, i) => (
                                <motion.tr key={cat._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group hover:bg-purple-500/5 transition-all">
                                   <td className="px-4 lg:px-8 py-3 lg:py-6 text-[10px] font-black text-slate-300 font-mono italic">#{String(i+1).padStart(2, '0')}</td>
                                   <td className="px-4 lg:px-8 py-3 lg:py-6">
                                      <div className="flex items-center gap-4">
                                         <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><Layers className="w-5 h-5" /></div>
                                         <span className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter group-hover:text-purple-500 transition-colors">{cat.categoryName}</span>
                                      </div>
                                   </td>
                                   <td className="px-4 lg:px-8 py-3 lg:py-6 text-center text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{cat.attemptCount.toLocaleString()} <span className="text-[8px] uppercase not-italic opacity-40 ml-1">attempts</span></td>
                                   <td className="px-4 lg:px-8 py-3 lg:py-6 text-center text-lg font-black text-indigo-500 tabular-nums tracking-tighter">{cat.avgScore.toFixed(1)}%</td>
                                   <td className="px-4 lg:px-8 py-3 lg:py-6">
                                      <div className="w-32 mx-auto">
                                         <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1"><span>Completion</span><span>{(cat.completionRate*100).toFixed(0)}%</span></div>
                                         <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"><motion.div initial={{width:0}} animate={{width:`${cat.completionRate * 100}%`}} className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" /></div>
                                      </div>
                                   </td>
                                   <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                                      <div className={`px-4 py-1.5 rounded-xl border-2 text-[8px] font-black uppercase tracking-widest inline-block ${cat.avgScore >= 75 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary-500/10 text-primary-500 border-primary-500/20'}`}>{cat.avgScore >= 75 ? 'Optimal' : 'Standard'}</div>
                                   </td>
                                </motion.tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default PerformanceAnalytics;

