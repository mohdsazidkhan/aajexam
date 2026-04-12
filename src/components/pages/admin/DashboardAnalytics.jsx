'use client';

import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import {
  Users,
  BarChart3,
  Wallet,
  Trophy,
  Clock,
  Star,
  User,
  BookOpen,
  Calendar,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ViewToggle from '../../ViewToggle';
import { isMobile } from 'react-device-detect';
import API from '../../../lib/api';
import Loading from '../../Loading';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardAnalytics = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivityViewMode, setRecentActivityViewMode] = useState(isMobile ? 'list' : 'table');

  useEffect(() => {
    setLoading(true);
    API.getAnalyticsDashboard()
      .then(res => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load dashboard analytics');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError('Failed to load dashboard analytics');
        setLoading(false);
      });
  }, []);

  const isDark = document.documentElement.classList.contains('dark');

  const chartTextColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Helper function to convert Tailwind gradient classes to CSS colors
  const getGradientColors = (gradientClass) => {
    const gradientMap = {
      'from-primary-500 to-indigo-600': '#3b82f6, #4f46e5',
      'from-green-500 to-emerald-600': '#10b981, #059669',
      'from-primary-500 to-primary-600': '#eab308, #ea580c',
      'from-purple-500 to-pink-600': '#8b5cf6, #db2777',
      'from-primary-500 to-primary-600': '#6366f1, #2563eb',
      'from-pink-500 to-rose-600': '#ec4899, #e11d48'
    };
    return gradientMap[gradientClass] || '#3b82f6, #4f46e5';
  };

  const levelLabels = data?.levelDistribution?.map(l => `Level ${l._id}`) || [];
  const levelCounts = data?.levelDistribution?.map(l => l.count) || [];

  const subscriptionLabels = data?.subscriptionDistribution?.map(s => s._id) || [];
  const subscriptionCounts = data?.subscriptionDistribution?.map(s => s.count) || [];

  const levelBarData = {
    labels: levelLabels,
    datasets: [{
      label: 'Users',
      data: levelCounts,
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }],
  };

  const subscriptionPieData = {
    labels: subscriptionLabels,
    datasets: [{
      label: 'Users',
      data: subscriptionCounts,
       data: subscriptionCounts,
       backgroundColor: [
         'rgba(79, 70, 229, 0.7)', // Indigo
         'rgba(16, 185, 129, 0.7)', // Emerald
         'rgba(245, 158, 11, 0.7)', // Amber
         'rgba(244, 63, 94, 0.7)'   // Rose
       ],
       borderColor: isDark ? 'rgba(5, 5, 5, 1)' : '#fff',
       borderWidth: 2,
     }]
   };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        labels: { color: chartTextColor }
      }
    },
    scales: {
      x: {
        ticks: { color: chartTextColor },
        grid: { color: gridColor }
      },
      y: {
        ticks: { color: chartTextColor },
        grid: { color: gridColor }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartTextColor,
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  // Limit recent activity items to 20 records
  const recentActivities = Array.isArray(data?.recentActivity)
    ? data.recentActivity.slice(0, 20)
    : [];

  // Recent Activity View Components
  const RecentActivityTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-[1200px] lg:w-full">
        <thead>
          <tr className="border-b-2 border-primary-200 dark:border-primary-700">
            <th className="text-left py-4 px-4 font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                User
              </div>
            </th>
            <th className="text-left py-4 px-4 font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Quiz
              </div>
            </th>
            <th className="text-left py-4 px-4 font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-indigo-500" />
                Score
              </div>
            </th>
            <th className="text-left py-4 px-4 font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Attempt Date
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {recentActivities.length > 0 ? (
            recentActivities.map((a, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {a.user?.name || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {a.quiz?.title ?
                      (a.quiz.title.length > 20 ? `${a.quiz.title.substring(0, 20)}...` : a.quiz.title)
                      : 'Unknown Quiz'
                    }
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${a.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      a.score >= 60 ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300' :
                        a.score >= 40 ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                      {a.score || 0}
                    </span>
                    <span className="text-xs text-slate-700 dark:text-gray-400 ml-1">
                      ({a.scorePercentage || 0}%)
                    </span>
                    {a.score >= 80 && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {(() => {
                        const date = new Date(a.attemptedAt);
                        const day = date.getDate().toString().padStart(2, '0');
                        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                        const month = monthNames[date.getMonth()];
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                      })()}
                    </div>
                    <div className="text-xs text-slate-700 dark:text-gray-400">
                      {new Date(a.attemptedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-12 text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 opacity-20" />
                  <span className="text-sm font-medium uppercase tracking-widest">No recent activity</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const RecentActivityCardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-4">
      {recentActivities.length > 0 ? (
        recentActivities.map((a, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-2xl p-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {a.user?.name || 'Unknown'}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">User</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500/10 rounded-md flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium limit-text-1">
                  {a.quiz?.title || 'Unknown Quiz'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500/10 rounded-md flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className={`text-sm font-semibold ${a.score >= 80 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {a.score || 0} Scored
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-500/10 rounded-md flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Attempted: {(() => {
                    const date = new Date(a.attemptedAt);
                    const day = date.getDate().toString().padStart(2, '0');
                    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    const month = monthNames[date.getMonth()];
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                  })()} at {new Date(a.attemptedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </div>

            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-slate-400">
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 opacity-20" />
            <span className="text-sm font-medium uppercase tracking-widest">No recent activity</span>
          </div>
        </div>
      )}
    </div>
  );

  const RecentActivityListView = () => (
    <div className="space-y-3">
      {recentActivities.length > 0 ? (
        recentActivities.map((a, i) => (
          <div key={i} className="bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {a.user?.name || 'Unknown'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-md flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {a.quiz?.title || 'Unknown Quiz'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-100 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/30 rounded-md flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className={`text-sm font-semibold ${a.score >= 80 ? 'text-green-600 dark:text-green-400' :
                    a.score >= 60 ? 'text-primary-700 dark:text-primary-500 dark:text-primary-400' :
                      a.score >= 40 ? 'text-primary-700 dark:text-primary-500 dark:text-primary-400' :
                        'text-primary-700 dark:text-primary-500 dark:text-red-400'
                    }`}>
                    {a.score || 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-md flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Attempted: {(() => {
                      const date = new Date(a.attemptedAt);
                      const day = date.getDate().toString().padStart(2, '0');
                      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                      const month = monthNames[date.getMonth()];
                      const year = date.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()} at {new Date(a.attemptedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                </div>

              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-slate-400">
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 opacity-20" />
            <span className="text-sm font-medium uppercase tracking-widest">No recent activity</span>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) return <Loading fullScreen={true} size="lg" color="yellow" message="" />;

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-red-700">
      <div className="container mx-auto py-0 lg:py-4 px-4 lg:px-10 bg-red-100 border border-red-400 px-4 py-3 rounded">
        {error}
      </div>
      </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-center text-slate-700 dark:text-gray-400 dark:text-gray-300">
      No data available
    </div>
  );

  return (
     <div className="text-slate-900 dark:text-white min-h-screen font-sans selection:bg-indigo-500/30">
<div className="w-full mx-auto text-slate-900 dark:text-white font-outfit">
           <div className="mb-4">
             <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
               <div className="space-y-4">
                 
                 <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                   Analytics <span className="text-indigo-600">Overview</span>
                 </h1>
                 <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                   Monitor platform performance metrics and trends.
                 </p>
               </div>
             </div>
           </div>

           {/* Metric Matrix */}
           <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-6 mb-4">
             {[
               {
                 label: 'Total Users',
                 icon: <Users />,
                 value: data.overview?.totalUsers,
                 gradient: 'text-indigo-600 bg-indigo-600/10 border-indigo-600/20'
               },
               {
                 label: 'Total Quizzes',
                 icon: <BarChart3 />,
                 value: data.overview?.totalQuizzes,
                 gradient: 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20'
               },
               {
                 label: 'TOTAL REVENUE',
                 icon: <Wallet />,
                 value: `₹${data.overview?.totalRevenue}`,
                 gradient: 'text-amber-600 bg-amber-600/10 border-amber-600/20'
               },
               {
                 label: 'Active Users',
                 icon: <Trophy />,
                 value: data.overview?.activeUsers,
                 gradient: 'text-purple-600 bg-purple-600/10 border-purple-600/20'
               },
               {
                 label: 'Total Attempts',
                 icon: <Clock />,
                 value: data.overview?.totalAttempts,
                 gradient: 'text-rose-600 bg-rose-600/10 border-rose-600/20'
               },
               {
                 label: 'Subscriptions',
                 icon: <Star />,
                 value: data.overview?.totalSubscriptions,
                 gradient: 'text-blue-600 bg-blue-600/10 border-blue-600/20'
               },
             ].map((stat, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-xl hover:border-indigo-600/30 transition-all hover:scale-[1.02]"
               >
                 <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
                   <div className={`p-4 rounded-2xl ${stat.gradient.split(' ').slice(1).join(' ')} ${stat.gradient.split(' ')[0]} group-hover:scale-110 transition-transform`}>
                     {React.cloneElement(stat.icon, { className: 'w-6 h-6' })}
                   </div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                 </div>
                 <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter italic leading-none group-hover:text-indigo-600 transition-colors">
                   {stat.value?.toLocaleString() || 0}
                 </div>
                 <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
               </motion.div>
             ))}
           </div>


          {/* Tables */}
          <div className="grid grid-cols-1 gap-4">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 lg:p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Recent Activity</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Latest quiz attempts and scores</p>
                  </div>
                </div>

                <ViewToggle
                  currentView={recentActivityViewMode}
                  onViewChange={setRecentActivityViewMode}
                  views={['table', 'list', 'grid']}
                />
              </div>

              {recentActivityViewMode === 'table' && <RecentActivityTableView />}
              {recentActivityViewMode === 'grid' && <RecentActivityCardView />}
              {recentActivityViewMode === 'list' && <RecentActivityListView />}
            </div>

          </div>
        </div>
      </div>
  );
};

export default DashboardAnalytics;






