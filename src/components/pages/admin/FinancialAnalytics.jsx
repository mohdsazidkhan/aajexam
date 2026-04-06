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
  ShieldCheck, Banknote, History, BarChart3
} from "lucide-react";

import { useSelector } from "react-redux";
import Sidebar from "../../Sidebar";
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';

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

function FinancialMetric({ icon: Icon, label, value, sub, color = "primary", i = 0 }) {
  const colors = {
    primary: "text-primary-500 bg-primary-500/10 border-primary-500/20",
    secondary: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 + 0.3 }}
      className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 hover:border-primary-500/30 transition-all shadow-xl overflow-hidden font-outfit"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</div>
      </div>
      <div className="space-y-1">
        <div className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none group-hover:text-primary-500 transition-colors italic">
          {value}
        </div>
        {sub !== undefined && (
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight opacity-60">
            {sub} ACTIVE ENTITIES
          </div>
        )}
      </div>
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors" />
    </motion.div>
  );
}

const FinancialAnalytics = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);
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

  return (
    <AdminMobileAppWrapper title="Revenue Analytics">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 lg:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden pt-12 lg:pt-8 font-outfit">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
              <div className="space-y-3 lg:space-y-6 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-2xl shadow-sm">
                    <Banknote className="w-6 h-6" />
                  </div>
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">ADMIN // FINANCIAL ANALYTICS</span>
                 </div>
                 <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                   Revenue Analytics
                 </h1>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group min-w-[200px]">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select name="period" value={filters.period} onChange={handleFilterChange} className="w-full pl-12 pr-10 py-4 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="last-7-days">Past 7 Days</option>
                      <option value="this-month">This Month</option>
                      <option value="previous-month">Prev Month</option>
                      <option value="last-3-months">Quarterly</option>
                      <option value="current-year">Annual</option>
                    </select>
                  </div>
                   <motion.button onClick={handleExport} whileHover={{ scale: 1.05 }} className="px-4 lg:px-8 py-4 bg-emerald-500 text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3">
                     <DownloadCloud className="w-4 h-4" /> EXPORT AUDIT
                   </motion.button>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end p-4 lg:p-10 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl lg:rounded-[3rem] border-4 border-emerald-500/20 relative overflow-hidden group">
               <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-4">Total Revenue Generated</span>
               <div className="flex items-center gap-3 shrink-0">
                 <IndianRupee className="w-8 h-8 lg:w-16 lg:h-16 stroke-[3] text-emerald-500" />
                 <span className="text-4xl lg:text-7xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic">{(data?.overview?.totalRevenue || 0).toLocaleString('en-IN')}</span>
               </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[80px] group-hover:scale-150 transition-transform duration-500" />
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
               <div className="flex items-center justify-center py-32">
                 <Loading size="md" color="emerald" message="Loading revenue data..." />
               </div>
            ) : error ? (
              <div className="text-center py-32 bg-rose-500/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-rose-500/10">
                <Zap className="w-16 h-16 text-rose-500 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Sync Error</h3>
                <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-12">
                
                {/* Financial Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                   <FinancialMetric i={0} color="emerald" icon={IndianRupee} label="Total Revenue" value={`₹${(data.overview?.totalRevenue || 0).toLocaleString('en-IN')}`} sub={data.overview?.totalRevenueCount} />
                   <FinancialMetric i={1} color="primary" icon={TrendingUp} label="Period Revenue" value={`₹${(data.overview?.periodRevenue || 0).toLocaleString('en-IN')}`} sub={data.overview?.periodRevenueCount} />
                   <FinancialMetric i={2} color="amber" icon={Layers} label="Subscription Plans" value={data.subscriptionStats?.length || 0} sub={data.subscriptionStats?.length} />
                   <FinancialMetric i={3} color="secondary" icon={CreditCard} label="Successful Payments" value={data.paymentStats?.reduce((sum, p) => sum + p.count, 0) || 0} sub={data.paymentStats?.reduce((sum, p) => sum + p.count, 0)} />
                </div>

                {/* Performance Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl relative">
                    <div className="flex items-center justify-between mb-4 lg:mb-8">
                       <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Subscription Tiers</h3>
                       <PieChart className="w-5 h-5 text-indigo-500 opacity-30" />
                    </div>
                    <div className="h-80">
                      <Pie data={{ labels: planLabels, datasets: [{ data: planCounts, backgroundColor: ['#6366F1','#8B5CF6','#10B981','#F59E0B','#EF4444'], borderWidth: 0 }] }} options={pieOptions} />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl relative">
                    <div className="flex items-center justify-between mb-4 lg:mb-8">
                       <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Revenue Velocity</h3>
                       <BarChart3 className="w-5 h-5 text-emerald-500 opacity-30" />
                    </div>
                    <div className="h-80">
                       <Line data={{ labels: revenueTrendLabels, datasets: [{ label: 'Revenue', data: revenueTrendData, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 }] }} options={chartOptions} />
                    </div>
                  </motion.div>
                </div>

                {/* Subscriptions Deep Dive */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between mb-4 lg:mb-12">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl"><Activity className="w-6 h-6" /></div>
                       <div>
                        <h3 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] leading-none mb-1">Plan Performance Breakdown</h3>
                        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase italic">Analyzing revenue by subscription plan</span>
                     </div>
                  </div>
               </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                              <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Rank</th>
                              <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Plan</th>
                              <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">User Count</th>
                              <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Revenue</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {topRevenuePlans.map((p, idx) => (
                            <motion.tr key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="group hover:bg-emerald-500/5 transition-all">
                               <td className="px-4 lg:px-8 py-3 lg:py-6">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-xs ${idx === 0 ? 'bg-amber-500 text-white shadow-xl rotate-6' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>{idx + 1}</div>
                               </td>
                               <td className="px-4 lg:px-8 py-3 lg:py-6">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ${idx === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'}`}>{p.planName?.[0] || 'P'}</div>
                                     <div>
                                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter group-hover:text-emerald-500 transition-colors">{p.planName || p._id || 'Unknown'}</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Subscription Category</div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                                  <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic">{p.count || 0} USERS</div>
                                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Subscribers</div>
                               </td>
                               <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                                  <div className="text-2xl font-black text-emerald-500 tabular-nums italic tracking-tighter">₹{p.totalRevenue?.toLocaleString('en-IN') || 0}</div>
                                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Revenue Generated</div>
                               </td>
                            </motion.tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
                </motion.div>

              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default FinancialAnalytics;

