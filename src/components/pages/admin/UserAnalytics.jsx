'use client';

import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

import {
  Filter,
  Download,
  BarChart3,
  LineChart,
  PieChart as PieChartIcon,
  ArrowLeft,
  Activity,
  Zap,
  ChevronRight,
  Search,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement
);

function exportCSV(data, filename) {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));
  for (const row of data) {
    csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  }
  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const UserAnalytics = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ period: 'month', level: '', subscription: '' });

  useEffect(() => {
    setLoading(true);
    API.getUserAnalytics(filters)
      .then(res => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load user analytics');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError('Failed to load user analytics');
        setLoading(false);
      });
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExport = () => {
    if (!data?.topPerformers?.length) return;
    const rows = data.topPerformers.map(u => ({
      Name: u.name || 'Unknown',
      Level: 0,
      'High Score Quizzes': 0,
      Subscription: u.subscriptionStatus || 'free'
    }));
    exportCSV(rows, 'top_performers.csv');
  };

  const chartColor = {
    text: {
      light: '#0f172a',
      dark: '#f8fafc'
    },
    grid: {
      light: 'rgba(0, 0, 0, 0.05)',
      dark: 'rgba(255, 255, 255, 0.05)'
    }
  };

  const levelLabels = data?.levelDistribution?.map(l => `Level ${l._id}`) || [];
  const levelCounts = data?.levelDistribution?.map(l => l.count) || [];
  const subscriptionLabels = data?.subscriptionStats?.map(s => s._id?.toUpperCase()) || [];
  const subscriptionCounts = data?.subscriptionStats?.map(s => s.count) || [];
  const userGrowthLabels = data?.userGrowth?.map(g => `${g._id.year}-${g._id.month}-${g._id.day}`) || [];
  const userGrowthCounts = data?.userGrowth?.map(g => g.count) || [];

  const levelBarData = {
    labels: levelLabels,
    datasets: [{
      label: 'Users',
      data: levelCounts,
      backgroundColor: 'rgba(79, 70, 229, 0.7)',
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 2,
      borderRadius: 12,
      hoverBackgroundColor: 'rgba(79, 70, 229, 0.9)',
    }]
  };

  const subscriptionPieData = {
    labels: subscriptionLabels,
    datasets: [{
      label: 'Subscriptions',
      data: subscriptionCounts,
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(244, 63, 94, 0.8)'
      ],
      offset: 20,
      borderWidth: 0,
      hoverOffset: 30
    }]
  };

  const userGrowthLineData = {
    labels: userGrowthLabels,
    datasets: [{
      label: 'New Users',
      data: userGrowthCounts,
      borderColor: 'rgba(79, 70, 229, 1)',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.5,
      pointRadius: 6,
      pointHoverRadius: 10,
      pointBackgroundColor: 'rgba(79, 70, 229, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 4
    }]
  };

  const baseOptions = (mode) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: mode === 'dark' ? '#1e293b' : '#fff',
        titleColor: mode === 'dark' ? '#fff' : '#0f172a',
        bodyColor: mode === 'dark' ? '#cbd5e1' : '#64748b',
        borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 16,
        boxPadding: 8,
        usePointStyle: true,
        titleFont: { family: 'Outfit', weight: '900', size: 12 },
        bodyFont: { family: 'Outfit', weight: '700', size: 11 }
      }
    },
    scales: {
      x: {
        ticks: { color: chartColor.text[mode], font: { family: 'Outfit', weight: '700', size: 10 } },
        grid: { display: false }
      },
      y: {
        ticks: { color: chartColor.text[mode], font: { family: 'Outfit', weight: '700', size: 10 } },
        grid: { color: chartColor.grid[mode], drawBorder: false }
      }
    }
  });

  const pieOptions = (mode) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartColor.text[mode],
          padding: 30,
          usePointStyle: true,
          font: { family: 'Outfit', weight: '900', size: 10 },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => ({
                text: `${label} (${data.datasets[0].data[i]})`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].backgroundColor[i],
                pointStyle: 'circle',
                hidden: false,
                index: i
              }));
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: mode === 'dark' ? '#1e293b' : '#fff',
        titleColor: mode === 'dark' ? '#fff' : '#0f172a',
        padding: 16,
        titleFont: { family: 'Outfit', weight: '900', size: 12 }
      }
    }
  });

  const mode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  if (loading) {
    return (
      <AdminMobileAppWrapper title="User Analytics">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-3 lg:p-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full shadow-2xl"
            />
            <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-indigo-500" />
          </div>
          <div className="mt-4 lg:mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Loading user analytics...</div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="User Analytics">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-sans text-slate-900 dark:text-white pb-20">
        {isMounted && <Sidebar />}
        <div className={`transition-all duration-500 ${isOpen ? 'p-4 lg:p-8' : 'p-4 lg:p-8'}`}>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Admin / User Analytics</span>
                </div>
                <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  User <span className="text-indigo-600">Analytics</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest max-w-xl leading-relaxed">User growth, level distribution, and subscription trends at a glance.</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleExport}
                  className="px-4 lg:px-8 py-4 bg-indigo-600 text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-duo-primary hover:scale-105 transition-transform flex items-center gap-3"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>
          </motion.div>

          {/* Controller Bar */}
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-4 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Filters</div>
                <div className="text-sm font-black italic uppercase tracking-tighter">Filter Options</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  name="period"
                  value={filters.period}
                  onChange={handleFilterChange}
                  className="pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-indigo-500/30 transition-all font-outfit"
                >
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past 30 Days</option>
                  <option value="quarter">Past 90 Days</option>
                  <option value="year">Full Year</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              <div className="relative">
                <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  placeholder="Filter by level..."
                  className="pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-inner w-full lg:w-48 placeholder:text-slate-400"
                />
              </div>

              <div className="relative">
                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="subscription"
                  value={filters.subscription}
                  onChange={handleFilterChange}
                  placeholder="Filter by plan..."
                  className="pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-inner w-full lg:w-48 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Visualizations Spectrum */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8 mb-4 lg:mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-12 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">By Level</div>
                    <div className="text-xl font-black italic uppercase tracking-tighter italic">Level Distribution</div>
                  </div>
                </div>
              </div>
              <div className="h-[400px]">
                {levelLabels.length > 0 ? <Bar data={levelBarData} options={baseOptions(mode)} /> : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                     <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                     <span className="text-[10px] font-black uppercase tracking-widest">No data available</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-12 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <PieChartIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">By Plan</div>
                    <div className="text-xl font-black italic uppercase tracking-tighter italic">Subscription Stats</div>
                  </div>
                </div>
              </div>
              <div className="h-[400px]">
                {subscriptionLabels.length > 0 ? <Pie data={subscriptionPieData} options={pieOptions(mode)} /> : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <PieChartIcon className="w-16 h-16 mb-4 opacity-20" />
                      <span className="text-[10px] font-black uppercase tracking-widest">No data available</span>
                   </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-12 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <LineChart className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Growth Trend</div>
                  <div className="text-xl font-black italic uppercase tracking-tighter italic">User Growth Over Time</div>
                </div>
              </div>
            </div>
            <div className="h-[400px] w-full">
              {userGrowthLabels.length > 0 ? <Line data={userGrowthLineData} options={baseOptions(mode)} /> : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <LineChart className="w-16 h-16 mb-4 opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No data available</span>
                 </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default UserAnalytics;

