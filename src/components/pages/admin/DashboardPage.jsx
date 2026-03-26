'use client';

import { useEffect, useRef, useState } from 'react';
import API from '../../../lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { useSSR } from '../../../hooks/useSSR';


const DashboardPage = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
    quizzes: 0,
    questions: 0,
    students: 0,
    bankDetails: 0,
    totalQuizAttempts: 0,
    subscriptions: 0,
    activeSubscriptions: 0,
    freeSubscriptions: 0,
    paidSubscriptions: 0,
    paymentOrders: 0,
    completedPaymentOrders: 0,
    totalRevenue: 0,
    // Article stats
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    pinnedArticles: 0,
    totalArticleViews: 0,
    totalArticleLikes: 0,
    // Withdraw requests stats
    withdrawRequests: 0,
    pendingWithdrawRequests: 0,
    // Detailed user questions stats
    approvedUserQuestions: 0,
    rejectedUserQuestions: 0,
    // Levels stats
    totalLevels: 0,
    activeLevels: 0,
    inactiveLevels: 0,
    // User Blogs stats
    userBlogs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch both analytics dashboard and admin stats
        const [analytics, adminStats, articleStats] = await Promise.all([
          API.getAnalyticsDashboard(),
          API.getAdminStats(),
          API.getArticleStats()
        ]);
        const overview = analytics?.data?.overview || {};
        setStats({
          ...adminStats,
          ...overview,
          ...articleStats.stats,
          totalArticleViews: articleStats.stats.totalViews || 0,
          totalArticleLikes: articleStats.stats.totalLikes || 0
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
        setStats({});
      } finally {
        setLoading(false);
      }
    };
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchStats();
  }, []);

  const cards = [
    // New cards for top
    {
      title: 'Active PRO Users',
      count: stats.currentMonthActiveProUsers || 0,
      icon: '👑',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-900',
      bgColor: 'bg-indigo-100',
      darkBgColor: 'dark:bg-indigo-900/20',
      gradientFrom: 'from-indigo-200',
      gradientTo: 'to-blue-200',
      darkGradientFrom: 'dark:from-indigo-700',
      darkGradientTo: 'dark:to-blue-800',
      subtitle: 'PRO users with valid subscription',
      link: '#'
    },
    {
      title: 'Dynamic Prize Pool',
      count: `₹${(stats.dynamicPrizePool || 0).toLocaleString()}`,
      icon: '💰',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-900',
      bgColor: 'bg-yellow-100',
      darkBgColor: 'dark:bg-yellow-900/20',
      gradientFrom: 'from-yellow-200',
      gradientTo: 'to-amber-200',
      darkGradientFrom: 'dark:from-yellow-700',
      darkGradientTo: 'dark:to-amber-800',
      subtitle: `Active PRO users × ${stats.prizePerPro || 95}`,
      link: '#'
    },
    {
      title: 'Total Users',
      count: stats.totalNonAdminUsers || 0,
      icon: '👥',
      color: 'bg-green-500',
      textColor: 'text-green-900',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/20',
      gradientFrom: 'from-green-200',
      gradientTo: 'to-emerald-200',
      darkGradientFrom: 'dark:from-green-700',
      darkGradientTo: 'dark:to-emerald-800',
      subtitle: 'All users except admin',
      link: '#'
    },
    {
      title: 'Active Users (Quiz Played)',
      count: stats.activeUsersCurrentMonth || 0,
      icon: '🔥',
      color: 'bg-red-500',
      textColor: 'text-red-900',
      bgColor: 'bg-red-100',
      darkBgColor: 'dark:bg-red-900/20',
      gradientFrom: 'from-red-200',
      gradientTo: 'to-rose-200',
      darkGradientFrom: 'dark:from-red-700',
      darkGradientTo: 'dark:to-rose-800',
      subtitle: 'Users who played quiz this month',
      link: '#'
    },
    {
      title: 'Categories',
      count: stats.categories,
      link: '/admin/categories',
      icon: '📚',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-900',
      bgColor: 'bg-yellow-100',
      darkBgColor: 'dark:bg-yellow-900/20',
      gradientFrom: 'from-yellow-200',
      gradientTo: 'to-amber-200',
      darkGradientFrom: 'dark:from-yellow-700',
      darkGradientTo: 'dark:to-amber-800'
    },
    {
      title: 'Subcategories',
      count: stats.subcategories,
      link: '/admin/subcategories',
      icon: '📂',
      color: 'bg-green-500',
      textColor: 'text-green-900',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/20',
      gradientFrom: 'from-green-200',
      gradientTo: 'to-emerald-200',
      darkGradientFrom: 'dark:from-green-700',
      darkGradientTo: 'dark:to-emerald-800'
    },
    {
      title: 'Levels',
      count: stats.totalLevels || 0,
      link: '/admin/levels',
      icon: '🎯',
      color: 'bg-teal-500',
      textColor: 'text-teal-900',
      bgColor: 'bg-teal-100',
      darkBgColor: 'dark:bg-teal-900/20',
      gradientFrom: 'from-teal-200',
      gradientTo: 'to-cyan-200',
      darkGradientFrom: 'dark:from-teal-700',
      darkGradientTo: 'dark:to-cyan-800',
      subtitle: `${stats.activeLevels || 0} active`
    },

    {
      title: 'Quizzes',
      count: stats.quizzes,
      link: '/admin/quizzes',
      icon: '🎯',
      color: 'bg-red-500',
      textColor: 'text-red-900',
      bgColor: 'bg-red-100',
      darkBgColor: 'dark:bg-red-900/20',
      gradientFrom: 'from-red-200',
      gradientTo: 'to-rose-200',
      darkGradientFrom: 'dark:from-red-700',
      darkGradientTo: 'dark:to-rose-800'
    },
    {
      title: 'User Quizzes',
      count: stats.userQuizzes || 0,
      link: '/admin/user-quizzes',
      icon: '🧪',
      color: 'bg-pink-500',
      textColor: 'text-pink-900',
      bgColor: 'bg-pink-100',
      darkBgColor: 'dark:bg-pink-900/20',
      gradientFrom: 'from-pink-200',
      gradientTo: 'to-fuchsia-200',
      darkGradientFrom: 'dark:from-pink-700',
      darkGradientTo: 'dark:to-fuchsia-800',
      subtitle: 'Submitted by users'
    },
    {
      title: 'Questions',
      count: stats.questions,
      link: '/admin/questions',
      icon: '❓',
      color: 'bg-orange-500',
      textColor: 'text-orange-900',
      bgColor: 'bg-orange-100',
      darkBgColor: 'dark:bg-orange-900/20',
      gradientFrom: 'from-orange-200',
      gradientTo: 'to-amber-200',
      darkGradientFrom: 'dark:from-orange-700',
      darkGradientTo: 'dark:to-amber-800'
    },
    {
      title: 'User Questions',
      count: stats.userQuestions || 0,
      link: '/admin/user-questions',
      icon: '💭',
      color: 'bg-purple-500',
      textColor: 'text-yellow-900',
      bgColor: 'bg-purple-100',
      darkBgColor: 'dark:bg-purple-900/20',
      gradientFrom: 'from-purple-200',
      gradientTo: 'to-pink-200',
      darkGradientFrom: 'dark:from-purple-700',
      darkGradientTo: 'dark:to-pink-800',
      subtitle: 'All submitted questions'
    },
    {
      title: 'User Blogs',
      count: stats.userBlogs || 0,
      link: '/admin/user-blogs',
      icon: '📝',
      color: 'bg-blue-500',
      textColor: 'text-blue-900',
      bgColor: 'bg-blue-100',
      darkBgColor: 'dark:bg-blue-900/20',
      gradientFrom: 'from-blue-200',
      gradientTo: 'to-cyan-200',
      darkGradientFrom: 'dark:from-blue-700',
      darkGradientTo: 'dark:to-cyan-800',
      subtitle: 'User submitted blogs'
    },
    {
      title: 'Approved Questions',
      count: stats.approvedUserQuestions || 0,
      link: '/admin/user-questions?status=approved',
      icon: '✅',
      color: 'bg-green-500',
      textColor: 'text-green-900',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/20',
      gradientFrom: 'from-green-200',
      gradientTo: 'to-emerald-200',
      darkGradientFrom: 'dark:from-green-700',
      darkGradientTo: 'dark:to-emerald-800',
      subtitle: 'Approved by admin'
    },

    {
      title: 'Withdraw Requests',
      count: stats.withdrawRequests || 0,
      link: '/admin/withdraw-requests',
      icon: '💰',
      color: 'bg-green-500',
      textColor: 'text-green-900',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/20',
      gradientFrom: 'from-green-200',
      gradientTo: 'to-emerald-200',
      darkGradientFrom: 'dark:from-green-700',
      darkGradientTo: 'dark:to-emerald-800',
      subtitle: 'Pending approval'
    },
    {
      title: 'Students',
      count: stats.students,
      link: '/admin/students',
      icon: '👥',
      color: 'bg-red-500',
      textColor: 'text-red-900',
      bgColor: 'bg-red-100',
      darkBgColor: 'dark:bg-red-900/20',
      gradientFrom: 'from-rose-200',
      gradientTo: 'to-pink-200',
      darkGradientFrom: 'dark:from-rose-700',
      darkGradientTo: 'dark:to-pink-800'
    },
    {
      title: 'Bank Details',
      count: stats.bankDetails,
      link: '/admin/bank-details',
      icon: '🏦',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-900',
      bgColor: 'bg-yellow-100',
      darkBgColor: 'dark:bg-yellow-900/20',
      gradientFrom: 'from-yellow-200',
      gradientTo: 'to-amber-200',
      darkGradientFrom: 'dark:from-yellow-600',
      darkGradientTo: 'dark:to-amber-700'
    },
    {
      title: 'Payment Orders',
      count: stats.paymentOrders || 0,
      link: '/admin/payment-transactions',
      icon: '💳',
      color: 'bg-green-500',
      textColor: 'text-green-900',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/20',
      gradientFrom: 'from-emerald-200',
      gradientTo: 'to-teal-200',
      darkGradientFrom: 'dark:from-emerald-700',
      darkGradientTo: 'dark:to-teal-800',
      subtitle: `${stats.completedPaymentOrders || 0} completed`
    },
    {
      title: 'Total Subscriptions',
      count: stats.subscriptions || 0,
      link: '/admin/subscriptions',
      icon: '👑',
      color: 'bg-purple-500',
      textColor: 'text-yellow-900',
      bgColor: 'bg-purple-100',
      darkBgColor: 'dark:bg-purple-900/20',
      gradientFrom: 'from-purple-200',
      gradientTo: 'to-fuchsia-200',
      darkGradientFrom: 'dark:from-purple-700',
      darkGradientTo: 'dark:to-fuchsia-800',
      subtitle: `${stats.activeSubscriptions || 0} active`
    },
    {
      title: 'Total Revenue',
      count: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      link: '/admin/payment-transactions',
      icon: '💰',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-900',
      bgColor: 'bg-emerald-100',
      darkBgColor: 'dark:bg-emerald-900/20',
      gradientFrom: 'from-green-200',
      gradientTo: 'to-emerald-200',
      darkGradientFrom: 'dark:from-green-700',
      darkGradientTo: 'dark:to-emerald-800',
      subtitle: 'From completed payments'
    },
    {
      title: 'Free Subscriptions',
      count: stats.freeSubscriptions || 0,
      link: '/admin/subscriptions',
      icon: '🆓',
      color: 'bg-gray-500',
      textColor: 'text-slate-900',
      bgColor: 'bg-slate-100',
      darkBgColor: 'dark:bg-gray-900/20',
      gradientFrom: 'from-slate-200',
      gradientTo: 'to-gray-200',
      darkGradientFrom: 'dark:from-slate-700',
      darkGradientTo: 'dark:to-gray-800',
      subtitle: 'Free plan users'
    },
    {
      title: 'Paid Subscriptions',
      count: stats.paidSubscriptions || 0,
      link: '/admin/subscriptions',
      icon: '💎',
      color: 'bg-indigo-500',
      textColor: 'text-red-900',
      bgColor: 'bg-indigo-100',
      darkBgColor: 'dark:bg-indigo-900/20',
      gradientFrom: 'from-yellow-200',
      gradientTo: 'to-blue-200',
      darkGradientFrom: 'dark:from-yellow-700',
      darkGradientTo: 'dark:to-blue-800',
      subtitle: 'Basic/Premium/Pro plans'
    },
    {
      title: 'Total Quizzes Attempted',
      count: stats.totalQuizAttempts,
      link: '/admin/performance-analytics',
      icon: '📊',
      color: 'bg-indigo-500',
      textColor: 'text-red-900',
      bgColor: 'bg-indigo-100',
      darkBgColor: 'dark:bg-indigo-900/20',
      gradientFrom: 'from-cyan-200',
      gradientTo: 'to-sky-200',
      darkGradientFrom: 'dark:from-cyan-700',
      darkGradientTo: 'dark:to-sky-800',
      subtitle: 'All quiz attempts'
    },
    // Article Cards
    {
      title: 'Total Articles',
      count: stats.totalArticles || 0,
      link: '/admin/articles',
      icon: '📝',
      color: 'bg-blue-500',
      textColor: 'text-blue-900',
      bgColor: 'bg-blue-50',
      darkBgColor: 'dark:bg-blue-900/20',
      gradientFrom: 'from-blue-200',
      gradientTo: 'to-sky-200',
      darkGradientFrom: 'dark:from-blue-700',
      darkGradientTo: 'dark:to-sky-800',
      subtitle: `${stats.publishedArticles || 0} published`
    },
    {
      title: 'Article Views',
      count: stats.totalArticleViews || 0,
      link: '/admin/articles',
      icon: '👁️',
      color: 'bg-green-500',
      textColor: 'text-green-900',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/20',
      gradientFrom: 'from-emerald-200',
      gradientTo: 'to-teal-200',
      darkGradientFrom: 'dark:from-emerald-700',
      darkGradientTo: 'dark:to-teal-800',
      subtitle: `${stats.totalArticleLikes || 0} likes`
    },
  ];

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  if (loading) {
    return (
      <AdminMobileAppWrapper title="Dashboard">
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          {user?.role === 'admin' && isAdminRoute && <Sidebar />}
          <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
            <div className="flex items-center justify-center h-64">
              <Loading size="md" color="yellow" message="Loading dashboard statistics..." />
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  if (error) {
    return (
      <AdminMobileAppWrapper title="Dashboard">
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          {user?.role === 'admin' && isAdminRoute && <Sidebar />}
          <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Dashboard">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          {/* Header */}
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl md:text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 hidden md:block">
              Welcome back! Here's an overview of your platform statistics.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-2 md:mb-4 lg:mb-8">
            {cards.map((card) => (
              <Link key={card.title} href={card.link} className="group">
                <div className={`relative overflow-hidden rounded-xl p-4 md:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r ${card.gradientFrom || ''} ${card.gradientTo || ''} ${card.darkGradientFrom || ''} ${card.darkGradientTo || ''} ${card.textColor} dark:text-white border border-gray-200 dark:border-white/10`}>
                  {/* Background Pattern */}
                  <div className={`absolute top-0 right-0 w-20 h-20 rounded-full ${card.color} opacity-10 -translate-y-10 translate-x-10`}></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2 lg:mb-4">
                      <div className={`text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-4xl`}>
                        {card.icon}
                      </div>
                      <div className={`w-16 lg:w-16 h-8 lg:h-12 rounded-lg ${card.bgColor} dark:bg-white/20 flex items-center justify-center`}>
                        <span className={`${card.textColor} dark:text-white font-bold text-lg`}>
                          {card.count}
                        </span>
                      </div>
                    </div>

                    {/* Mobile: inline title and subtitle; Desktop: stacked */}
                    <div className="flex md:hidden justify-between items-center gap-1 mb-1">
                      <h3 className={`text-base font-semibold ${card.textColor} dark:text-white`}>
                        {card.title}
                      </h3>
                      <span className={`text-sm ${card.textColor} dark:text-white/90`}>
                        {card.subtitle || 'Total'}
                      </span>
                    </div>
                    <h3 className={`hidden md:block text-lg font-semibold mb-1 ${card.textColor} dark:text-white`}>
                      {card.title}
                    </h3>
                    <p className={`hidden md:block text-sm ${card.textColor} dark:text-white/90`}>
                      {card.subtitle || 'Total'}
                    </p>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className={`w-5 h-5 ${card.textColor} dark:text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-700 dark:to-emerald-800 rounded-xl p-3 lg:p-6 text-green-900 dark:text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 dark:text-green-200 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-white">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-green-600 dark:text-green-300 text-xs mt-1">From all completed payments</p>
                </div>
                <div className="text-4xl text-green-600 dark:text-green-300">💰</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-3 lg:p-6 text-blue-900 dark:text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 dark:text-blue-200 text-sm font-medium">Payment Success Rate</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-white">
                    {stats.paymentOrders > 0 ? Math.round((stats.completedPaymentOrders / stats.paymentOrders) * 100) : 0}%
                  </p>
                  <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
                    {stats.completedPaymentOrders || 0} of {stats.paymentOrders || 0} orders
                  </p>
                </div>
                <div className="text-4xl text-blue-600 dark:text-blue-300">📊</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-800 rounded-xl p-3 lg:p-6 text-yellow-900 dark:text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-700 dark:text-yellow-200 text-sm font-medium">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-white">{stats.activeSubscriptions || 0}</p>
                  <p className="text-orange-700 dark:text-yellow-300 text-xs mt-1">
                    {stats.subscriptions > 0 ? Math.round((stats.activeSubscriptions / stats.subscriptions) * 100) : 0}% of total
                  </p>
                </div>
                <div className="text-4xl text-orange-700 dark:text-yellow-300">👑</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-700 dark:to-red-800 rounded-xl p-3 lg:p-6 text-orange-900 dark:text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 dark:text-orange-200 text-sm font-medium">Free vs Paid</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-white">{stats.freeSubscriptions || 0} / {stats.paidSubscriptions || 0}</p>
                  <p className="text-orange-700 dark:text-orange-300 text-xs mt-1">
                    Free plan / Paid plans
                  </p>
                </div>
                <div className="text-4xl text-orange-700 dark:text-orange-300">📊</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🚀 Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">


              <Link href="/admin/categories" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">📚</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Create Category</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add New Category Content</p>
                </div>
              </Link>

              <Link href="/admin/subcategories" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800/30 dark:hover:to-emerald-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">📂</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Create Subcategoy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add New Subcategoy Content</p>
                </div>
              </Link>

              <Link href="/admin/levels" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 hover:from-teal-100 hover:to-teal-200 dark:hover:from-teal-800/30 dark:hover:to-teal-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Manage Levels</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configure User Progression Levels</p>
                </div>
              </Link>

              <Link href="/admin/quizzes" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-800/30 dark:hover:to-yellow-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Create Quiz</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add New Quiz Content</p>
                </div>
              </Link>

              <Link href="/admin/questions" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800/30 dark:hover:to-orange-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">❓</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Create Questions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add New Questions to Quiz</p>
                </div>
              </Link>

              <Link href="/admin/articles" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">📝</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Manage Articles</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Create & Manage Blog Articles</p>
                </div>
              </Link>

              <Link href="/admin/user-questions" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-purple-50 from-red-100 dark:from-purple-900/20 dark:from-red-800/20 hover:from-purple-100 hover:from-red-200 dark:hover:from-purple-800/30 dark:hover:from-red-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">💭</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">All User Questions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View all submitted questions</p>
                </div>
              </Link>

              <Link href="/admin/user-questions?status=pending" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-800/30 dark:hover:to-yellow-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">⏳</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Pending Questions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Review questions awaiting approval</p>
                </div>
              </Link>

              <Link href="/admin/user-questions?status=approved" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">✅</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Approved Questions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View approved questions</p>
                </div>
              </Link>

              <Link href="/admin/user-questions?status=rejected" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/30 dark:hover:to-red-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">❌</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Rejected Questions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View rejected questions</p>
                </div>
              </Link>

              <Link href="/admin/withdraw-requests" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">💰</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Review Withdraw Requests</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Approve/Reject User Withdrawal Requests</p>
                </div>
              </Link>

              <Link href="/admin/students" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/30 dark:hover:to-red-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">👥</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Manage Students</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage Students Content</p>
                </div>
              </Link>

              <Link href="/admin/contacts" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 hover:from-pink-100 hover:to-pink-200 dark:hover:from-pink-800/30 dark:hover:to-pink-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">👥</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Contact List</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View Contactst Queries</p>
                </div>
              </Link>

              <Link href="/admin/payment-transactions" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">💳</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Payment Transactions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View All Payment Transactions & Revenue</p>
                </div>
              </Link>

              <Link href="/admin/subscriptions" className="flex items-center p-4 rounded-lg bg-gradient-to-r from-purple-50 from-red-100 dark:from-purple-900/20 dark:from-red-800/20 hover:from-purple-100 hover:from-red-200 dark:hover:from-purple-800/30 dark:hover:from-red-700/30 transition-all duration-300">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">👑</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">User Subscriptions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage All User Subscriptions</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default DashboardPage;





