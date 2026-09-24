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
  Download,
  BarChart3,
  LineChart,
  PieChart as PieChartIcon,
  ArrowLeft,
  Zap,
  Search,
  Calendar
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import { AdminDashboardSkeleton } from '../../admin/Skeletons';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../Sidebar';
import StyledSelect from '../../ui/StyledSelect';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';


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

  const subscriptionLabels = data?.subscriptionStats?.map(s => s._id?.toUpperCase()) || [];
  const subscriptionCounts = data?.subscriptionStats?.map(s => s.count) || [];
  const userGrowthLabels = data?.userGrowth?.map(g => `${g._id.year}-${g._id.month}-${g._id.day}`) || [];
  const userGrowthCounts = data?.userGrowth?.map(g => g.count) || [];

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

  const periodSelect = (
    <StyledSelect
      icon={Calendar}
      value={filters.period}
      onChange={(val) => setFilters({ ...filters, period: val })}
      options={[
        { value: 'week', label: 'Past 7 Days' },
        { value: 'month', label: 'Past 30 Days' },
        { value: 'quarter', label: 'Past 90 Days' },
        { value: 'year', label: 'Full Year' }
      ]}
      className="col-span-2 sm:col-span-1"
    />
  );

  const exportButton = (
    <button
      onClick={handleExport}
      className="w-full col-span-2 lg:col-span-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-700"
    >
      <Download className="w-4 h-4" /> Export to CSV
    </button>
  );

  useAdminMobileHeader({
    title: 'User Stats',
    count: null,
    filters: (
      <>
        {periodSelect}
        {exportButton}
      </>
    )
  });

  if (loading) {
    return (
      <div className="min-h-screen p-3 lg:p-8">
        <AdminDashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-900 dark:text-white pb-20">
      {isMounted && <Sidebar />}
      <div className="adminContent w-full mx-auto">

        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-12 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-500/10 text-primary-600 rounded-lg lg:rounded-xl">
                <LineChart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Growth Trend</div>
                <div className="text-xl font-black uppercase tracking-tighter italic">User Growth Over Time</div>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            {userGrowthLabels.length > 0 ? <Line data={userGrowthLineData} options={baseOptions(mode)} /> : (
              <div className="h-auto flex flex-col items-center justify-center text-slate-300">
                <LineChart className="w-16 h-16 mb-4 opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-widest">No data available</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserAnalytics;

