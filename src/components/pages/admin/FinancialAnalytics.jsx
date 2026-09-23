'use client';

import config from '../../../lib/config/appConfig';
import React, { useEffect, useState } from "react";
import { Pie, Line, Bar } from "react-chartjs-2";
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
  LineElement,
} from "chart.js";

import {
  Activity, CreditCard, Download, Filter,
  IndianRupee, Layers, LayoutDashboard,
  LineChart, PieChart, TrendingUp, Wallet, Zap, Cpu,
  Search, Calendar, DownloadCloud, ArrowUpRight, ArrowDownRight,
  ShieldCheck, History, BarChart3
} from "lucide-react";

import API from '../../../lib/api';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminDashboardSkeleton } from '../../skeletons/AdminSkeletons';
import ResponsiveTable from '../../ResponsiveTable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function exportCSV(data, filename) {
  if (!data || !data.length) return;
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
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

const FinancialAnalytics = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ period: "this-month" });

  useEffect(() => {
    if (!isMounted || !isRouterReady) return;
    setLoading(true);
    setError(null);
    API.getFinancialAnalytics({ period: filters.period })
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.message || "Revenue data unavailable");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load financial data");
        setLoading(false);
      });
  }, [filters, isMounted, isRouterReady]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleExport = () => {
    if (!data?.topRevenuePlans?.length) return;
    const rows = data.topRevenuePlans.map(p => ({
      Plan: p.planName || p._id, Revenue: p.totalRevenue, Count: p.count
    }));
    exportCSV(rows, "financial_audit.csv");
  };

  if (!isMounted) return null;

  const isDark = typeof window !== 'undefined' ? document.documentElement.classList.contains("dark") : false;
  const chartTextColor = isDark ? "#A0AEC0" : "#4A5568";

  const planLabels = data?.planDistribution?.map(p => {
    const n = p._id || 'Unknown';
    return n.charAt(0).toUpperCase() + n.slice(1);
  }) || [];
  const planCounts = data?.planDistribution?.map(p => p.count) || [];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueTrendLabels = data?.revenueTrend?.map(r => `${monthNames[(r._id?.month || 1) - 1]} ${r._id?.year || ''}`) || [];
  const revenueTrendData = data?.revenueTrend?.map(r => r.revenue || 0) || [];

  const paymentLabels = data?.paymentStats?.map(p => (p._id || 'unknown').toUpperCase()) || [];
  const paymentCounts = data?.paymentStats?.map(p => p.count || 0) || [];

  const topRevenuePlans = (data?.topRevenuePlans || []).slice().sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));

  const planColumns = [
    {
      key: 'rank',
      header: 'Rank',
      render: (_, p) => {
        const idx = topRevenuePlans.indexOf(p);
        return (
          <div className={`w-10 h-10 rounded-lg lg:rounded-xl flex items-center justify-center font-black italic text-xs ${idx === 0 ? 'bg-primary-600 text-white shadow-sm rotate-6' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>{idx + 1}</div>
        );
      }
    },
    {
      key: 'plan',
      header: 'Subscription Plan',
      render: (_, p) => {
        const idx = topRevenuePlans.indexOf(p);
        return (
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${idx === 0 ? 'bg-primary-600 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'}`}>{p.planName?.[0] || 'P'}</div>
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter transition-colors">{p.planName || p._id || 'Unknown'}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Subscription Plan</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'count',
      header: 'User Count',
      render: (_, p) => (
        <div className="text-center">
          <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic">{p.count || 0} USERS</div>
          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Subscribers</div>
        </div>
      )
    },
    {
      key: 'totalRevenue',
      header: 'Total Revenue',
      render: (_, p) => (
        <div className="text-right">
          <div className="text-2xl font-black text-primary-600 tabular-nums italic tracking-tighter">₹{p.totalRevenue?.toLocaleString('en-IN') || 0}</div>
          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</div>
        </div>
      )
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: chartTextColor, font: { family: 'Outfit', size: 10 } } },
      y: { grid: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }, ticks: { color: chartTextColor, font: { family: 'Outfit', size: 10 } } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: chartTextColor, usePointStyle: true, font: { family: 'Outfit', size: 11, weight: 'bold' }, padding: 20 } }
    }
  };

  return (<div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><IndianRupee className="w-6 h-6 text-primary-600 shrink-0" /> Financial <span className="text-slate-400 dark:text-slate-500">(₹{(data?.overview?.totalRevenue || 0).toLocaleString('en-IN')})</span></h1>

            <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
              <div className="relative col-span-2 sm:w-48">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select name="period" value={filters.period} onChange={handleFilterChange} className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm appearance-none cursor-pointer">
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last-7-days">Past 7 Days</option>
                  <option value="this-month">This Month</option>
                  <option value="previous-month">Prev Month</option>
                  <option value="last-3-months">Quarterly</option>
                  <option value="current-year">Annual</option>
                </select>
              </div>
              <button onClick={handleExport} className="col-span-2 lg:col-span-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-700 shrink-0">
                <DownloadCloud className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
               <div className="flex items-center justify-center py-32">
                 <AdminDashboardSkeleton />
               </div>
            ) : error ? (
              <div className="text-center py-32 bg-black/5 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-black/10 dark:border-white/10">
                <Zap className="w-16 h-16 text-black dark:text-white mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Something went wrong</h3>
                <p className="text-black dark:text-white text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-4 lg:space-y-12">
                
                {/* Financial Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-0 lg:divide-x divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 lg:p-0 p-2">
                  {[
                    { label: 'Total Revenue', val: `₹${(data.overview?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee },
                    { label: 'Period Revenue', val: `₹${(data.overview?.periodRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp },
                    { label: 'Subscription Plans', val: data.subscriptionStats?.length || 0, icon: Layers },
                    { label: 'Successful Payments', val: data.paymentStats?.reduce((sum, p) => sum + p.count, 0) || 0, icon: CreditCard }
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2 px-3 py-2">
                      <div className="p-1.5 bg-primary-500/10 text-primary-600 rounded-lg shrink-0"><stat.icon className="w-3.5 h-3.5" /></div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tight truncate">{stat.val}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Performance Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-sm relative">
                    <div className="flex items-center justify-between mb-4 lg:mb-8">
                       <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Subscription Tiers</h3>
                       <PieChart className="w-5 h-5 text-primary-600 opacity-30" />
                    </div>
                    <div className="h-80">
                      <Pie data={{ labels: planLabels, datasets: [{ data: planCounts, backgroundColor: ['#6366F1','#8B5CF6','#10B981','#F59E0B','#EF4444'], borderWidth: 0 }] }} options={pieOptions} />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-sm relative">
                    <div className="flex items-center justify-between mb-4 lg:mb-8">
                       <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Revenue Over Time</h3>
                       <BarChart3 className="w-5 h-5 text-primary-600 opacity-30" />
                    </div>
                    <div className="h-80">
                       <Line data={{ labels: revenueTrendLabels, datasets: [{ label: 'Revenue', data: revenueTrendData, borderColor: '#58cc02', backgroundColor: 'rgba(88,204,2,0.1)', fill: true, tension: 0.4 }] }} options={chartOptions} />
                    </div>
                  </motion.div>
                </div>

                {/* Subscriptions Deep Dive */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-primary-500/10 text-primary-600 rounded-2xl"><Activity className="w-6 h-6" /></div>
                       <div>
                        <h3 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] leading-none mb-1">Plan Performance Breakdown</h3>
                        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase italic">Revenue breakdown by subscription plan</span>
                     </div>
                  </div>
               </div>
                  
                  <div className="overflow-x-auto">
                    <ResponsiveTable data={topRevenuePlans} columns={planColumns} viewModes={['table']} defaultView="table" showViewToggle={false} />
                  </div>
                </motion.div>

              </div>
            )}
          </AnimatePresence>
        </div>
  );
};

export default FinancialAnalytics;

