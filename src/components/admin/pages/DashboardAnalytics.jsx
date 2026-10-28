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
import ViewToggle from '../../common/ViewToggle';
import { isMobile } from 'react-device-detect';
import API from '../../../lib/api';
import { useSSR } from '../../../hooks/useSSR';
import { m as motion, AnimatePresence } from 'framer-motion';
import ResponsiveTable from '../../common/ResponsiveTable';
import Pagination from '../../common/Pagination';
import { AdminDashboardSkeleton, AdminTableSkeleton } from '../Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardAnalytics = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentActivityViewMode, setRecentActivityViewMode] = useState(isMobile ? 'list' : 'table');
  const [activityPage, setActivityPage] = useState(1);
  const [activityLimit, setActivityLimit] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (data === null) setLoading(true); else setActivityLoading(true);
    API.getAnalyticsDashboard({ page: activityPage, limit: activityLimit })
      .then(res => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load dashboard analytics');
        }
        setLoading(false);
        setActivityLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError('Failed to load dashboard analytics');
        setLoading(false);
        setActivityLoading(false);
      });
  }, [activityPage, activityLimit]);

  const handleActivityLimitChange = (val) => {
    setActivityLimit(val);
    setActivityPage(1);
  };

  const isDark = document.documentElement.classList.contains('dark');

  const chartTextColor = isDark ? '#ffffff' : '#000000';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Helper function to convert Tailwind gradient classes to CSS colors
  const getGradientColors = (gradientClass) => {
    const gradientMap = {
      'bg-primary-600': '#3b82f6, #4f46e5',
      'bg-primary-600': '#10b981, #059669',
      'bg-primary-600': '#eab308, #ea580c',
      'bg-primary-600': '#8b5cf6, #db2777',
      'bg-primary-600': '#6366f1, #2563eb',
'bg-primary-600':'#ec4899, #e11d48'
    };
    return gradientMap[gradientClass] || '#3b82f6, #4f46e5';
  };

  const subscriptionLabels = data?.subscriptionDistribution?.map(s => s._id) || [];
  const subscriptionCounts = data?.subscriptionDistribution?.map(s => s.count) || [];

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

  const recentActivities = Array.isArray(data?.recentActivity) ? data.recentActivity : [];
  const activityPagination = data?.recentActivityPagination || { totalItems: 0, totalPages: 1 };

  // Recent Activity View Components
  const recentActivityColumns = [
    {
      key: 'user',
      header: (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary-600" />
          User
        </div>
      ),
      render: (_, a) => (
        <div className="flex items-center gap-3">
          <span className="font-semibold text-content-primary">
            {a.user?.name || 'Unknown'}
          </span>
        </div>
      )
    },
    {
      key: 'quiz',
      header: (
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-600" />
          Quiz / Exam
        </div>
      ),
      render: (_, a) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-[0.08em] ${a.type === 'exam' ? 'bg-black/10 text-content-primary' : 'text-primary-600'}`}>
            {a.type === 'exam' ? 'Exam' : 'Quiz'}
          </span>
          <span className="text-content-secondary font-medium whitespace-nowrap">
            {a.quiz?.title || 'Unknown'}
          </span>
        </div>
      )
    },
    {
      key: 'score',
      header: (
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary-600" />
          Score
        </div>
      ),
      render: (_, a) => (
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${a.score >= 80 ? 'text-primary-600' :
            a.score >= 60 ? 'text-primary-600' :
              a.score >= 40 ? 'text-primary-600' :
                'bg-background-surface-secondary text-content-primary'
            }`}>
            {a.score || 0}
          </span>
          <span className="text-xs text-content-secondary ml-1">
            ({a.scorePercentage || 0}%)
          </span>
          {a.score >= 80 && <Trophy className="w-3.5 h-3.5 text-content-primary" />}
        </div>
      )
    },
    {
      key: 'attemptedAt',
      header: (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-600" />
          Attempt Date
        </div>
      ),
      render: (_, a) => (
        <div className="text-sm text-content-secondary">
          <div className="font-medium text-content-primary">
            {(() => {
              const date = new Date(a.attemptedAt);
              const day = date.getDate().toString().padStart(2, '0');
              const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
              const month = monthNames[date.getMonth()];
              const year = date.getFullYear();
              return `${day}-${month}-${year}`;
            })()}
          </div>
          <div className="text-xs text-content-secondary">
            {new Date(a.attemptedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </div>
        </div>
      )
    }
  ];

  const RecentActivityTableView = () => (
    recentActivities.length > 0 ? (
      <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col relative">
        <ResponsiveTable
          data={recentActivities}
          columns={recentActivityColumns}
          viewModes={['table']}
          defaultView={'table'}
          showPagination={false}
          showViewToggle={false}
          fillHeight
        />
      </div>
    ) : (
      <div className="text-center py-12 text-content-muted">
        <div className="flex flex-col items-center gap-2">
          <FileText className="w-8 h-8 opacity-20" />
          <span className="text-sm font-medium uppercase tracking-[0.08em]">No recent activity</span>
        </div>
      </div>
    )
  );

  const RecentActivityCardView = () => (
    <div className="h-full overflow-y-auto grid grid-cols-1 xl:grid-cols-2 xl:grid-cols-3 gap-3 content-start">
      {recentActivities.length > 0 ? (
        recentActivities.map((a, i) => (
          <div key={i} className="bg-background-surface border border-border-primary rounded-2xl p-4 transition-all duration-200 relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center border border-primary-600">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-content-primary text-sm">
                  {a.user?.name || 'Unknown'}
                </h4>
                <p className="text-xs text-content-secondary">User</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center border border-primary-600">
                  <BookOpen className="w-3.5 h-3.5 text-primary-600" />
                </div>
                <span className="text-sm text-content-secondary font-medium limit-text-1">
                  {a.quiz?.title || 'Unknown Quiz'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black/10 dark:bg-white/10 rounded-md flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-content-primary" />
                </div>
                <span className={`text-sm font-semibold ${a.score >= 80 ? 'text-primary-600' : 'text-content-secondary'}`}>
                  {a.score || 0} Scored
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center border border-primary-600">
                  <Calendar className="w-3.5 h-3.5 text-primary-600" />
                </div>
                <span className="text-xs text-content-secondary">
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
        <div className="col-span-full text-center py-12 text-content-muted">
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 opacity-20" />
            <span className="text-sm font-medium uppercase tracking-[0.08em]">No recent activity</span>
          </div>
        </div>
      )}
    </div>
  );

  const RecentActivityListView = () => (
    <div className="h-full overflow-y-auto space-y-3">
      {recentActivities.length > 0 ? (
        recentActivities.map((a, i) => (
          <div key={i} className="border border-primary-200 dark:border-primary-600 rounded-lg p-4 transition-all duration-200">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md flex items-center justify-center border border-primary-600">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-content-primary">
                    {a.user?.name || 'Unknown'}
                  </h4>
                  <p className="text-sm text-content-secondary">User</p>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center border border-primary-600">
                    <BookOpen className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                  <span className="text-sm text-content-secondary font-medium">
                    {a.quiz?.title || 'Unknown Quiz'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center border border-primary-600">
                    <Trophy className="w-3.5 h-3.5 text-content-primary" />
                  </div>
                  <span className={`text-sm font-semibold ${a.score >= 80 ? 'text-primary-600' :
                    a.score >= 60 ? 'text-primary-600' :
                      a.score >= 40 ? 'text-primary-600' :
                        'text-primary-600 dark:text-white'
                    }`}>
                    {a.score || 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center border border-primary-600">
                    <Calendar className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                  <span className="text-sm text-content-secondary">
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
        <div className="text-center py-12 text-content-muted">
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 opacity-20" />
            <span className="text-sm font-medium uppercase tracking-[0.08em]">No recent activity</span>
          </div>
        </div>
      )}
    </div>
  );

  const statCardsSection = (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 xl:gap-3 mb-4 shrink-0">
      {[
        { label: 'Total Users', icon: Users, value: data?.overview?.totalUsers },
        { label: 'Total Quizzes', icon: BarChart3, value: data?.overview?.totalQuizzes },
        { label: 'Total Revenue', icon: Wallet, value: `₹${data?.overview?.totalRevenue || 0}` },
        { label: 'Active Users', icon: Trophy, value: data?.overview?.activeUsers },
        { label: 'Total Attempts', icon: Clock, value: data?.overview?.totalAttempts },
        { label: 'Subscriptions', icon: Star, value: data?.overview?.totalSubscriptions },
      ].map((stat, i) => (
        <div
          key={i}
          className="flex items-center gap-2 p-3 bg-background-surface rounded-xl xl:rounded-2xl border border-border-primary relative"
        >
          <div className="p-2 text-on-primary rounded-lg shrink-0 bg-primary-600">
            <stat.icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm xl:text-base font-bold text-content-primary tabular-nums tracking-tight whitespace-nowrap">
              {stat.value?.toLocaleString?.() || stat.value || 0}
            </div>
            <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] whitespace-nowrap">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const viewToggleButtons = (
    <ViewToggle
      currentView={recentActivityViewMode}
      onViewChange={setRecentActivityViewMode}
      views={['table', 'list', 'grid']}
      fullWidth
    />
  );

  const paginationControl = activityPagination.totalItems > 0 && (
    <Pagination
      compact
      currentPage={activityPage}
      totalPages={activityPagination.totalPages || 1}
      onPageChange={setActivityPage}
      totalItems={activityPagination.totalItems}
      itemsPerPage={activityLimit}
      onItemsPerPageChange={handleActivityLimitChange}
    />
  );

  useAdminMobileHeader({
    title: 'Overview',
    count: null,
    filters: (
      <>
        {viewToggleButtons}
        {paginationControl}
      </>
    )
  });

  if (loading) return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col text-content-primary font-sans">
      <div className="w-full mx-auto text-content-primary font-outfit pt-4 xl:pt-6 flex-1 min-h-0 overflow-auto">
        <AdminDashboardSkeleton />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background-page p-4 text-content-primary">
      <div className="container mx-auto py-0 xl:py-2.5 px-4 xl:px-10 bg-background-surface-secondary border border-black dark:border-white py-2 rounded">
        {error}
      </div>
      </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-background-page p-4 text-center text-content-secondary">
      No data available
    </div>
  );

  return (
     <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col text-content-primary font-sans">
<div className="w-full mx-auto text-content-primary font-outfit pt-4 xl:pt-6 flex-1 min-h-0 overflow-auto flex flex-col">
           {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          {statCardsSection}

          {/* Tables */}
          <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-3">
            {/* Recent Activity */}
            <div className="flex-1 min-h-0 overflow-auto flex flex-col">
              <div className="flex-1 min-h-0 overflow-auto">
                {activityLoading ? (
                  <div className="py-12"><AdminTableSkeleton showHeader={false} showFilters={false} /></div>
                ) : (
                  <>
                    {recentActivityViewMode === 'table' && <RecentActivityTableView />}
                    {recentActivityViewMode === 'grid' && <RecentActivityCardView />}
                    {recentActivityViewMode === 'list' && <RecentActivityListView />}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
  );
};

export default DashboardAnalytics;






