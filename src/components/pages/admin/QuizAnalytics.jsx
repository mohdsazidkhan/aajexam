'use client';

// QuizAnalytics.jsx â€“ Part 1
import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import {
  FileText, Activity, PieChart, Filter, Download, Trophy, Clock, Star,
  Search, Calendar, BarChart3, ChevronRight, LayoutGrid, List, Table as TableIcon,
  Cpu, Globe, Zap, Target
} from 'lucide-react';

import Sidebar from "../../Sidebar";
import { useSelector } from 'react-redux';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { useSSR } from '../../../hooks/useSSR';
import Button from '../../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function exportCSV(data, filename) {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));
  for (const row of data) {
    csvRows.push(headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  }
  const csv = csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const QuizAnalytics = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const [filters, setFilters] = useState({
    period: "month",
    category: "",
    difficulty: "",
  });



  useEffect(() => {
    setLoading(true);
    API.getQuizAnalytics(filters)
      .then((res) => {
        if (res.success) {
          console.log("Quiz Analytics Data:", res.data);
          console.log("Top Quizzes:", res.data?.topQuizzes
          );
          setData(res.data);
        } else {
          setError(res.message || "Failed to load quiz analytics");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError("Failed to load quiz analytics");
        setLoading(false);
      });
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExportTop = () => {
    if (!data?.topQuizzes?.length) return;
    const rows = data.topQuizzes.map((q) => ({
      Quiz: q.quizTitle || q.title || q.quiz?.title || "Unknown",
      Attempts: q.attemptCount || q.attempts || q.totalAttempts || 0,
      "Avg Score": q.avgScore ? q.avgScore.toFixed(2) : q.averageScore ? q.averageScore.toFixed(2) : "0.00",
    }));
    exportCSV(rows, "top_quizzes.csv");
  };

  const handleExportRecent = () => {
    if (!data?.recentQuizzes?.length) return;
    const rows = data.recentQuizzes.map((q) => ({
      Title: q.title || "Unknown",
      Category: q.category?.name || "Unknown",
      Difficulty: q.difficulty || "Unknown",
      Created: formatDate(q.createdAt),
    }));
    exportCSV(rows, "recent_quizzes.csv");
  };

  if (loading) {
    return <Loading fullScreen={true} size="lg" color="yellow" message="" />;
  }

  if (error) {
    return (
      <div className="min-h-screen p-3 lg:p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen p-3 lg:p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto text-center text-slate-700 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const categoryLabels =
    data.categoryStats?.map((c) => c.categoryName?.[0] || "Unknown") || [];
  const categoryCounts = data.categoryStats?.map((c) => c.quizCount) || [];
  const difficultyLabels = data.difficultyStats?.map((d) => d._id) || [];
  const difficultyCounts = data.difficultyStats?.map((d) => d.count) || [];

  const categoryBarData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "Quizzes",
        data: categoryCounts,
        backgroundColor: "rgba(79, 70, 229, 0.7)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
      },
    ],
  };

  const levelLabels = data.levelStats?.map((l) => l._id || "Unknown") || [];
  const levelCounts = data.levelStats?.map((l) => l.count) || [];

  const levelBarData = {
    labels: levelLabels,
    datasets: [
      {
        label: "Quizzes",
        data: levelCounts,
        backgroundColor: "rgba(251, 191, 36, 0.7)",
        borderColor: "rgba(251, 191, 36, 1)",
        borderWidth: 1,
      },
    ],
  };

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

   const difficultyPieData = {
     labels: difficultyLabels,
     datasets: [
       {
         label: "Quizzes",
         data: difficultyCounts,
         backgroundColor: [
           "rgba(79, 70, 229, 0.7)", // Indigo
           "rgba(16, 185, 129, 0.7)", // Emerald
           "rgba(245, 158, 11, 0.7)", // Amber
           "rgba(244, 63, 94, 0.7)",   // Rose
         ],
         borderColor: isDark ? "#050505" : "#fff",
         borderWidth: 2,
       },
     ],
   };

  const chartColor = {
    text: {
      light: '#000000',
      dark: '#ffffff'
    },
    grid: {
      light: 'rgba(0, 0, 0, 0.1)',
      dark: 'rgba(255, 255, 255, 0.1)'
    }
  };

  const mode = isDark ? 'dark' : 'light';

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: chartColor.text[mode] },
        grid: { color: chartColor.grid[mode] },
      },
      y: {
        ticks: { color: chartColor.text[mode] },
        grid: { color: chartColor.grid[mode] },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: chartColor.text[mode],
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  return (
    <AdminMobileAppWrapper title="Quiz Analytics">
      <div
        className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"
          } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
      >
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">
          {/* Header with Theme Toggle */}
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-4"
           >
             <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
               <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl">
                     <BarChart3 className="w-6 h-6" />
                   </div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Admin / Quiz Analytics</span>
                  </div>
                  <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                    Quiz <span className="text-indigo-600">Analytics</span>
                  </h1>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                    Overview of quiz engagement, difficulty distribution, and performance trends.
                  </p>
               </div>

              <div className="flex flex-wrap items-center gap-4">
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportTop}
                    className="px-4 lg:px-8 py-4 bg-white dark:bg-white/5 text-slate-600 dark:text-white border-4 border-slate-100 dark:border-white/10 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-3"
                  >
                    <Download className="w-4 h-4" /> Export Top Quizzes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportRecent}
                    className="px-4 lg:px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 flex items-center gap-3"
                  >
                    <Download className="w-4 h-4" /> Export Recent
                  </motion.button>
              </div>
            </div>
          </motion.div>

            {/* Filter Interface */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-4 shadow-2xl">
             <div className="flex flex-wrap items-center gap-3 lg:gap-8">
               <div className="flex items-center gap-4 px-3 lg:px-6 py-4 bg-slate-100 dark:bg-white/10 rounded-2xl shadow-inner border-2 border-slate-200/50 dark:border-white/5">
                 <Filter className="w-4 h-4 text-indigo-600" />
                 <select
                   name="period"
                   value={filters.period}
                   onChange={handleFilterChange}
                   className="bg-transparent text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest focus:outline-none cursor-pointer outline-none"
                 >
                   <option value="week">Past 7 Days</option>
                   <option value="month">Past 30 Days</option>
                   <option value="quarter">Past 90 Days</option>
                   <option value="year">Full Year</option>
                 </select>
               </div>
 
               <div className="flex-1 relative group w-full lg:max-w-xs">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input
                   type="text"
                   name="category"
                   value={filters.category}
                   onChange={handleFilterChange}
                   placeholder="Search category..."
                   className="w-full pl-14 pr-8 py-5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-inner"
                 />
               </div>
 
               <div className="flex-1 relative group w-full lg:max-w-xs">
                 <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input
                   type="text"
                   name="difficulty"
                   value={filters.difficulty}
                   onChange={handleFilterChange}
                   placeholder="Search difficulty..."
                   className="w-full pl-14 pr-8 py-5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-inner"
                 />
               </div>
             </div>
           </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-8 mb-4">
              {[
                { label: 'TOTAL QUIZZES', val: data.overview?.totalQuizzes || 0, icon: FileText, color: 'indigo' },
                { label: 'TOTAL ATTEMPTS', val: data.overview?.totalAttempts || 0, icon: Activity, color: 'emerald' },
                { label: 'AVERAGE SCORE', val: `${data.overview?.avgScore?.toFixed(1) || 0}%`, icon: Star, color: 'amber' }
              ].map((stat, i) => (
               <motion.div
                 key={stat.label}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-4 lg:p-10 rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl group hover:border-indigo-600/30 transition-all relative overflow-hidden"
               >
                 <div className={`p-5 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 w-fit mb-4 lg:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner`}>
                   <stat.icon className="w-8 h-8" />
                 </div>
                 <div className="text-2xl lg:text-4xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-white mb-4 italic leading-none">
                   {stat.val.toLocaleString()}
                 </div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                 <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-3xl`} />
               </motion.div>
             ))}
           </div>


          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-8 mb-4 lg:mb-8">
             {/* Syllabus Allocation Bar Chart */}
             <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-4 lg:p-10 rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl lg:col-span-1">
               <div className="flex items-center gap-4 mb-4 lg:mb-10">
                 <div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-2xl shadow-inner">
                   <Target className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] leading-none mb-1 italic">Category Distribution</h3>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Quizzes per category</p>
                 </div>
               </div>
               {categoryLabels.length > 0 ? (
                 <div className="h-72">
                   <Bar data={categoryBarData} options={chartOptions} />
                 </div>
               ) : (
                 <div className="h-72 flex flex-col items-center justify-center text-slate-300 space-y-3 lg:space-y-6">
                   <Globe className="w-16 h-16 opacity-10" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">No data available</span>
                 </div>
               )}
             </div>
 
             {/* Proficiency Tiers Bar Chart */}
             <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-4 lg:p-10 rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl lg:col-span-1">
               <div className="flex items-center gap-4 mb-4 lg:mb-10">
                 <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl shadow-inner">
                   <Trophy className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] leading-none mb-1 italic">Difficulty Levels</h3>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Quizzes by difficulty level</p>
                 </div>
               </div>
               {levelLabels.length > 0 ? (
                 <div className="h-72">
                   <Bar data={levelBarData} options={chartOptions} />
                 </div>
               ) : (
                 <div className="h-72 flex flex-col items-center justify-center text-slate-300 space-y-3 lg:space-y-6">
                   <Activity className="w-16 h-16 opacity-10" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">No data available</span>
                 </div>
               )}
             </div>
 
             {/* Complexity Metrics Pie Chart */}
             <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-4 lg:p-10 rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl lg:col-span-1">
               <div className="flex items-center gap-4 mb-4 lg:mb-10">
                 <div className="p-4 bg-rose-500/10 text-rose-600 rounded-2xl shadow-inner">
                   <Zap className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] leading-none mb-1 italic">Difficulty Breakdown</h3>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Quiz count by difficulty</p>
                 </div>
               </div>
               {difficultyLabels.length > 0 ? (
                 <div className="h-72">
                   <Pie data={difficultyPieData} options={pieOptions} />
                 </div>
               ) : (
                 <div className="h-72 flex flex-col items-center justify-center text-slate-300 space-y-3 lg:space-y-6">
                   <PieChart className="w-16 h-16 opacity-10" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">No data available</span>
                 </div>
               )}
             </div>


          </div>



          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
             {/* Efficacy Leaderboard Ledger */}
             <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden">
               <div className="p-3 lg:p-10 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
                 <div className="flex items-center gap-4">
                   <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl shadow-inner">
                     <Trophy className="w-7 h-7" />
                   </div>
                   <div>
                     <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] leading-none mb-1 italic">Top Performing Quizzes</h3>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Most attempted quizzes by users</p>
                   </div>
                 </div>
               </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                      <th className="px-3 lg:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                      <th className="px-3 lg:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quiz Name</th>
                      <th className="px-3 lg:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Attempts</th>
                      <th className="px-3 lg:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.topQuizzes?.length > 0 ? (
                      data.topQuizzes.map((q, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all"
                        >
                          <td className="px-3 lg:px-6 py-4 text-xs font-black text-slate-400 tabular-nums">
                            {i + 1}
                          </td>
                          <td className="px-3 lg:px-6 py-4">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                              {q.quizTitle || q.title || q.quiz?.title || "Unknown"}
                            </span>
                          </td>
                          <td className="px-3 lg:px-6 py-4 text-center text-sm font-black text-slate-900 dark:text-white tabular-nums">
                            {q.attemptCount || q.attempts || q.totalAttempts || 0}
                          </td>
                          <td className="px-3 lg:px-6 py-4 text-right">
                            <span className="text-sm font-black text-indigo-500 tabular-nums">
                              {q.avgScore ? q.avgScore.toFixed(1) : q.averageScore ? q.averageScore.toFixed(1) : "0.0"}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-0 lg:py-4 xl:py-6 text-slate-700 dark:text-gray-400"
                        >
                          No quizzes found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

             {/* Latest Registry Additions */}
             <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden">
               <div className="p-3 lg:p-10 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
                 <div className="flex items-center gap-4">
                   <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl shadow-inner">
                     <Clock className="w-7 h-7" />
                   </div>
                   <div>
                     <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] leading-none mb-1 italic">Recent Quiz Additions</h3>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Recently added quizzes</p>
                   </div>
                 </div>
               </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                      <th className="px-3 lg:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">S.No.</th>
                      <th className="px-3 lg:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                      <th className="px-3 lg:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="px-3 lg:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Difficulty</th>
                      <th className="px-3 lg:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentQuizzes?.length > 0 ? (
                      data.recentQuizzes.map((q, i) => (                        <tr
                          key={i}
                          className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all"
                        >
                          <td className="px-3 lg:px-6 py-4 text-xs font-black text-slate-400 tabular-nums">
                            {i + 1}
                          </td>
                          <td className="px-3 lg:px-6 py-4">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                              {q.title || "Unknown"}
                            </span>
                          </td>
                          <td className="px-3 lg:px-6 py-4">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg">
                              {q.category?.name || "Unknown"}
                            </span>
                          </td>
                          <td className="px-3 lg:px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${q.difficulty === "expert"
                                ? "bg-rose-500/10 text-rose-500"
                                : q.difficulty === "advanced" || q.difficulty === "intermediate"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-emerald-500/10 text-emerald-500"
                                }`}
                            >
                              {q.difficulty || "Unknown"}
                            </span>
                          </td>
                          <td className="px-3 lg:px-6 py-4 text-right text-xs font-black text-slate-400 tabular-nums">
                            {formatDate(q.createdAt)}
                          </td>
                        </tr>

                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-0 lg:py-4 xl:py-6 text-slate-700 dark:text-gray-400"
                        >
                          No quizzes found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default QuizAnalytics;



