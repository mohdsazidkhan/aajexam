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
import { FaUsers, FaChartBar, FaMoneyBillWave, FaTrophy, FaClock, FaStar, FaUser, FaBook, FaCalendarAlt, FaMedal, FaCrown, FaAward } from 'react-icons/fa';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Sidebar from '../../Sidebar';
import ViewToggle from '../../ViewToggle';
import { isMobile } from 'react-device-detect';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { useSSR } from '../../../hooks/useSSR';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardAnalytics = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivityViewMode, setRecentActivityViewMode] = useState(isMobile ? 'list' : 'table');
  const [topUsersViewMode, setTopUsersViewMode] = useState(isMobile ? 'list' : 'table');
  const [activeTab, setActiveTab] = useState('monthly');
  const [topPerformers, setTopPerformers] = useState([]);
  const [topPerformersLoading, setTopPerformersLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.getAnalyticsDashboard()
      .then(res => {
        if (res.success) {
          console.log('Dashboard Data:', res.data);
          console.log('Top Users:', res.data?.topUsers);
          console.log('Top Users Monthly Progress:', res.data?.topUsers?.map(u => ({
            name: u.name,
            monthlyProgress: u.monthlyProgress
          })));
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

  useEffect(() => {
    setTopPerformersLoading(true);
    API.getAdminTopPerformers({ type: activeTab, limit: 10 })
      .then(res => {
        if (res.success) {
          setTopPerformers(res.data);
        }
        setTopPerformersLoading(false);
      })
      .catch(err => {
        console.error('Top Performers Error:', err);
        setTopPerformersLoading(false);
      });
  }, [activeTab]);

  const isDark = document.documentElement.classList.contains('dark');

  const chartTextColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Helper function to convert Tailwind gradient classes to CSS colors
  const getGradientColors = (gradientClass) => {
    const gradientMap = {
      'from-blue-500 to-indigo-600': '#3b82f6, #4f46e5',
      'from-green-500 to-emerald-600': '#10b981, #059669',
      'from-yellow-500 to-orange-600': '#eab308, #ea580c',
      'from-purple-500 to-pink-600': '#8b5cf6, #db2777',
      'from-yellow-500 to-blue-600': '#6366f1, #2563eb',
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
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(251, 191, 36, 0.7)'
      ],
      borderColor: isDark ? 'rgba(17, 24, 39, 1)' : '#fff',
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
      <table className="w-[1200px] md:w-full">
        <thead>
          <tr className="border-b-2 border-blue-200 dark:border-blue-700">
            <th className="text-left py-4 px-4 font-bold text-blue-800 dark:text-blue-200 text-lg">
              <div className="flex items-center gap-2">
                <FaUser className="text-blue-600 dark:text-blue-400" />
                User
              </div>
            </th>
            <th className="text-left py-4 px-4 font-bold text-blue-800 dark:text-blue-200 text-lg">
              <div className="flex items-center gap-2">
                <FaBook className="text-blue-600 dark:text-blue-400" />
                Quiz
              </div>
            </th>
            <th className="text-left py-4 px-4 font-bold text-blue-800 dark:text-blue-200 text-lg">
              <div className="flex items-center gap-2">
                <FaTrophy className="text-blue-600 dark:text-blue-400" />
                Score
              </div>
            </th>
            <th className="text-left py-4 px-4 font-bold text-blue-800 dark:text-blue-200 text-lg">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600 dark:text-blue-400" />
                Attempted At
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {recentActivities.length > 0 ? (
            recentActivities.map((a, i) => (
              <tr
                key={i}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-200 group"
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
                      a.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        a.score >= 40 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                      {a.score || 0}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({a.scorePercentage || 0}%)
                    </span>
                    {a.score >= 80 && <FaTrophy className="text-yellow-500 text-sm" />}
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
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(a.attemptedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-0 md:py-2 lg:py-4 xl:py-6 text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">📝</span>
                  <span>No recent activity</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const RecentActivityCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recentActivities.length > 0 ? (
        recentActivities.map((a, i) => (
          <div key={i} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                <FaUser className="text-blue-600 dark:text-blue-400" />
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
                <div className="w-6 h-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-md flex items-center justify-center">
                  <FaBook className="text-green-600 dark:text-green-400 text-xs" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {a.quiz?.title || 'Unknown Quiz'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-md flex items-center justify-center">
                  <FaTrophy className="text-orange-700 dark:text-yellow-400 text-xs" />
                </div>
                <span className={`text-sm font-semibold ${a.score >= 80 ? 'text-green-600 dark:text-green-400' :
                  a.score >= 60 ? 'text-orange-700 dark:text-yellow-400' :
                    a.score >= 40 ? 'text-orange-700 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                  }`}>
                  {a.score || 0}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-md flex items-center justify-center">
                  <FaCalendarAlt className="text-orange-700 dark:text-yellow-400 text-xs" />
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
        <div className="col-span-full text-center py-0 md:py-2 lg:py-4 xl:py-6 text-gray-500 dark:text-gray-400">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">📝</span>
            <span>No recent activity</span>
          </div>
        </div>
      )}
    </div>
  );

  const RecentActivityListView = () => (
    <div className="space-y-3">
      {recentActivities.length > 0 ? (
        recentActivities.map((a, i) => (
          <div key={i} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                  <FaUser className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {a.user?.name || 'Unknown'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-md flex items-center justify-center">
                    <FaBook className="text-green-600 dark:text-green-400 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {a.quiz?.title || 'Unknown Quiz'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-md flex items-center justify-center">
                    <FaTrophy className="text-orange-700 dark:text-yellow-400 text-xs" />
                  </div>
                  <span className={`text-sm font-semibold ${a.score >= 80 ? 'text-green-600 dark:text-green-400' :
                    a.score >= 60 ? 'text-orange-700 dark:text-yellow-400' :
                      a.score >= 40 ? 'text-orange-700 dark:text-orange-400' :
                        'text-red-600 dark:text-red-400'
                    }`}>
                    {a.score || 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-md flex items-center justify-center">
                    <FaCalendarAlt className="text-orange-700 dark:text-yellow-400 text-xs" />
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
        <div className="text-center py-0 md:py-2 lg:py-4 xl:py-6 text-gray-500 dark:text-gray-400">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">📝</span>
            <span>No recent activity</span>
          </div>
        </div>
      )}
    </div>
  );

  // Top Users View Components
  const TopUsersTableView = () => (
    <div className="overflow-x-auto relative">
      <table className="w-full min-w-full table-auto text-sm md:text-base">
        <thead>
          <tr className={`border-b-2 ${activeTab === 'daily' ? 'border-blue-200 dark:border-blue-700' : activeTab === 'weekly' ? 'border-purple-200 dark:border-purple-700' : 'border-yellow-200 dark:border-yellow-700'}`}>
            <th className={`text-left py-3 px-2 font-bold text-sm w-[15%] ${activeTab === 'daily' ? 'text-blue-800 dark:text-blue-200' : activeTab === 'weekly' ? 'text-purple-800 dark:text-purple-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              <div className="flex items-center gap-1">
                <FaMedal className={`text-sm ${activeTab === 'daily' ? 'text-blue-600' : activeTab === 'weekly' ? 'text-purple-600' : 'text-orange-700 dark:text-yellow-400'}`} />
                Rank
              </div>
            </th>
            <th className={`text-left py-3 px-2 font-bold text-sm w-[20%] ${activeTab === 'daily' ? 'text-blue-800 dark:text-blue-200' : activeTab === 'weekly' ? 'text-purple-800 dark:text-purple-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              <div className="flex items-center gap-1">
                <FaUser className={`text-sm ${activeTab === 'daily' ? 'text-blue-600' : activeTab === 'weekly' ? 'text-purple-600' : 'text-orange-700 dark:text-yellow-400'}`} />
                Name
              </div>
            </th>
            <th className={`text-left py-3 px-2 font-bold text-sm w-[20%] ${activeTab === 'daily' ? 'text-blue-800 dark:text-blue-200' : activeTab === 'weekly' ? 'text-purple-800 dark:text-purple-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              <div className="flex items-center gap-1">
                <FaTrophy className={`text-sm ${activeTab === 'daily' ? 'text-blue-600' : activeTab === 'weekly' ? 'text-purple-600' : 'text-orange-700 dark:text-yellow-400'}`} />
                Level
              </div>
            </th>
            <th className={`text-left py-3 px-2 font-bold text-sm w-[15%] ${activeTab === 'daily' ? 'text-blue-800 dark:text-blue-200' : activeTab === 'weekly' ? 'text-purple-800 dark:text-purple-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              <div className="flex items-center gap-1">
                <FaChartBar className={`text-sm ${activeTab === 'daily' ? 'text-blue-600' : activeTab === 'weekly' ? 'text-purple-600' : 'text-orange-700 dark:text-yellow-400'}`} />
                {activeTab === 'daily' ? 'Daily' : activeTab === 'weekly' ? 'Weekly' : 'Monthly'} Quizzes
              </div>
            </th>
            <th className={`text-left py-3 px-2 font-bold text-sm w-[15%] ${activeTab === 'daily' ? 'text-blue-800 dark:text-blue-200' : activeTab === 'weekly' ? 'text-purple-800 dark:text-purple-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              <div className="flex items-center gap-1">
                <FaAward className={`text-sm ${activeTab === 'daily' ? 'text-blue-600' : activeTab === 'weekly' ? 'text-purple-600' : 'text-orange-700 dark:text-yellow-400'}`} />
                High Scores
              </div>
            </th>
            <th className={`text-left py-3 px-2 font-bold text-sm w-[15%] ${activeTab === 'daily' ? 'text-blue-800 dark:text-blue-200' : activeTab === 'weekly' ? 'text-purple-800 dark:text-purple-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              <div className="flex items-center gap-1">
                <FaStar className={`text-sm ${activeTab === 'daily' ? 'text-blue-600' : activeTab === 'weekly' ? 'text-purple-600' : 'text-orange-700 dark:text-yellow-400'}`} />
                Accuracy
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {topPerformers?.length > 0 ? (
            topPerformers.map((u, i) => (
              <tr
                key={i}
                className={`border-b transition-all duration-200 border-gray-200 group ${i === 0 ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20" :
                  i === 1 ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20" :
                    i === 2 ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20" : ""
                  }`}
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 text-sm flex items-center justify-center rounded-full font-bold ${i === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg" :
                      i === 1 ? "bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-md" :
                        i === 2 ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md" :
                          "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                      }`}>
                      {i === 0 ? <FaCrown className="text-sm" /> : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {u.name || 'Unknown'}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {u.level?.levelName || 'No Level'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Level {u.level?.currentLevel || 0}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-bold text-orange-800 dark:text-orange-200">
                        {u.progress?.totalQuizAttempts || 0}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-800 dark:text-green-200">
                        {u.progress?.highScoreWins || 0}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-800 dark:text-blue-200">
                        {u.progress?.accuracy || 0}%
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-500 dark:text-gray-400">
                {topPerformersLoading ? 'Loading...' : 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const TopUsersCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {topPerformers?.length > 0 ? (
        topPerformers.map((u, i) => (
          <div key={i} className={`bg-gradient-to-r border rounded-lg p-4 hover:shadow-lg transition-all duration-200 ${i === 0 ? "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700" :
            i === 1 ? "from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700" :
              i === 2 ? "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700" :
                "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700"
            }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 text-sm flex items-center justify-center rounded-full font-bold ${i === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg" :
                  i === 1 ? "bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-md" :
                    i === 2 ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md" :
                      "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                  }`}>
                  {i === 0 ? <FaCrown className="text-sm" /> : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {u.name || 'Unknown'}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Rank #{i + 1}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-md flex items-center justify-center">
                  <FaTrophy className="text-orange-700 dark:text-yellow-400 text-xs" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {u.level?.levelName || 'No Level'} (Level {u.level?.currentLevel || 0})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-md flex items-center justify-center">
                  <FaChartBar className="text-orange-700 dark:text-orange-400 text-xs" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {u.progress?.totalQuizAttempts || 0} Total Quizzes
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-md flex items-center justify-center">
                  <FaAward className="text-green-600 dark:text-green-400 text-xs" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {u.progress?.highScoreWins || 0} High Scores
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-md flex items-center justify-center">
                  <FaStar className="text-teal-600 dark:text-teal-400 text-xs" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {u.progress?.accuracy || 0}% Accuracy
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-0 md:py-2 lg:py-4 xl:py-6 text-gray-500 dark:text-gray-400">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">👥</span>
            <span>No users found</span>
          </div>
        </div>
      )}
    </div>
  );

  const TopUsersListView = () => (
    <div className="space-y-3">
      {topPerformers?.length > 0 ? (
        topPerformers.map((u, i) => (
          <div key={i} className={`bg-gradient-to-r border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${i === 0 ? "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700" :
            i === 1 ? "from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700" :
              i === 2 ? "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700" :
                "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700"
            }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 text-sm flex items-center justify-center rounded-full font-bold ${i === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg" :
                  i === 1 ? "bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-md" :
                    i === 2 ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md" :
                      "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                  }`}>
                  {i === 0 ? <FaCrown className="text-sm" /> : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {u.name || 'Unknown'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rank #{i + 1}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-md flex items-center justify-center">
                    <FaTrophy className="text-orange-700 dark:text-yellow-400 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {u.level?.levelName || 'No Level'} (Level {u.level?.currentLevel || 0})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-md flex items-center justify-center">
                    <FaChartBar className="text-orange-700 dark:text-orange-400 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {u.progress?.totalQuizAttempts || 0} Total Quizzes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-md flex items-center justify-center">
                    <FaAward className="text-green-600 dark:text-green-400 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {u.progress?.highScoreWins || 0} High Scores
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-md flex items-center justify-center">
                    <FaStar className="text-teal-600 dark:text-teal-400 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {u.progress?.accuracy || 0}% Accuracy
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          {topPerformersLoading ? 'Loading...' : 'No data available'}
        </div>
      )}
    </div>
  );

  if (loading) return <Loading fullScreen={true} size="lg" color="yellow" message="" />;

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-red-700">
      <div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10 bg-red-100 border border-red-400 px-4 py-3 rounded">
        {error}
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-center text-gray-500 dark:text-gray-300">
      No data available
    </div>
  );

  return (
    <AdminMobileAppWrapper title="Analytics">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
          <div className="mb-4 lg:mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-3xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive overview of platform performance and user engagement
                </p>
              </div>

            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 lg:gap-6 mb-4 lg:mb-8">
            {[
              {
                label: 'Total Users',
                icon: <FaUsers />,
                value: data.overview?.totalUsers,
                gradient: 'from-blue-500 to-indigo-600'
              },
              {
                label: 'Total Quizzes',
                icon: <FaChartBar />,
                value: data.overview?.totalQuizzes,
                gradient: 'from-green-500 to-emerald-600'
              },
              {
                label: 'Total Revenue',
                icon: <FaMoneyBillWave />,
                value: `₹${data.overview?.totalRevenue}`,
                gradient: 'from-yellow-500 to-orange-600'
              },
              {
                label: 'Active Users',
                icon: <FaTrophy />,
                value: data.overview?.activeUsers,
                gradient: 'from-purple-500 to-pink-600'
              },
              {
                label: 'Total Attempts',
                icon: <FaClock />,
                value: data.overview?.totalAttempts,
                color: 'indigo',
                gradient: 'from-yellow-500 to-blue-600',
                bgGradient: 'from-yellow-50 to-blue-50',
                darkBgGradient: 'from-yellow-900/20 to-blue-900/20'
              },
              {
                label: 'Subscriptions',
                icon: <FaStar />,
                value: data.overview?.totalSubscriptions,
                gradient: 'from-pink-500 to-rose-600'
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    {React.cloneElement(stat.icon, { className: 'w-8 h-8 text-white' })}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold mb-2 uppercase tracking-wide text-gray-600 dark:text-gray-300">{stat.label}</p>
                    <p className="text-xl lg:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{
                      backgroundImage: `linear-gradient(to right, ${getGradientColors(stat.gradient)})`
                    }}>
                      {stat.value?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 lg:p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Level Distribution</h3>
              {levelLabels.length > 0 ? (
                <Bar data={levelBarData} options={chartOptions} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 lg:p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Subscription Distribution</h3>
              {subscriptionLabels.length > 0 ? (
                <Pie data={subscriptionPieData} options={pieOptions} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 gap-4">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 lg:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Latest user quiz attempts and activities</p>
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

            {/* Top Users Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 lg:p-6 mb-4 lg:mb-6 relative overflow-hidden">
              {topPerformersLoading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}
              <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-r rounded-xl flex items-center justify-center ${activeTab === 'daily' ? 'from-blue-400 to-indigo-500' : activeTab === 'weekly' ? 'from-purple-400 to-pink-500' : 'from-yellow-400 to-orange-500'}`}>
                    <FaCrown className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-md lg:text-2xl font-bold text-gray-800 dark:text-white">
                      Top Performers
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Based on {activeTab === 'daily' ? 'Today\'s' : activeTab === 'weekly' ? 'This Week\'s' : 'This Month\'s'} performance
                    </p>
                  </div>
                </div>

                {/* Competition Tabs */}
                <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab('daily')}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-300 flex items-center gap-1.5 ${activeTab === 'daily'
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800"
                      }`}
                  >
                    <span>📅</span> Daily
                  </button>
                  <button
                    onClick={() => setActiveTab('weekly')}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-300 flex items-center gap-1.5 ${activeTab === 'weekly'
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-500 hover:text-purple-600 hover:bg-white dark:hover:bg-gray-800"
                      }`}
                  >
                    <span>🗓️</span> Weekly
                  </button>
                  <button
                    onClick={() => setActiveTab('monthly')}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-300 flex items-center gap-1.5 ${activeTab === 'monthly'
                      ? "bg-amber-500 text-white shadow-lg"
                      : "text-gray-500 hover:text-amber-600 hover:bg-white dark:hover:bg-gray-800"
                      }`}
                  >
                    <span>🏆</span> Monthly
                  </button>
                </div>

                <ViewToggle
                  currentView={topUsersViewMode}
                  onViewChange={setTopUsersViewMode}
                  views={['table', 'grid', 'list']}
                />
              </div>

              {topUsersViewMode === 'table' && <TopUsersTableView />}
              {topUsersViewMode === 'grid' && <TopUsersCardView />}
              {topUsersViewMode === 'list' && <TopUsersListView />}
            </div>
          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default DashboardAnalytics;




