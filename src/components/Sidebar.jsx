import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useSSR } from '../hooks/useSSR';
import {
  MdDashboard, MdCategory, MdQuiz, MdQuestionAnswer, MdPeople,
  MdAnalytics, MdTrendingUp, MdLogout, MdAccountBalance, MdCardGiftcard,
  MdNotifications, MdPerson,
  MdArticle, MdSchool, MdAssignment, MdHistory, MdEmojiEvents, MdContactMail,
  MdLayers, MdClass, MdMoneyOff, MdBarChart, MdSettingsBackupRestore
} from 'react-icons/md';
import { isAdmin, hasAdminPrivileges, logAdminAction } from '../lib/utils/adminUtils';
import { secureLogout } from '../lib/utils/authUtils';
import { toggleSidebar } from '../store/sidebarSlice';

const Sidebar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const handleNavClick = (page) => {
    dispatch(toggleSidebar());
    logAdminAction('navigate', page, { timestamp: new Date().toISOString() });
  };

  const isActiveRoute = (path) => {
    if (router?.pathname === path) return true;
    if (path === '/admin/dashboard' || path === '/admin/govt-exams') return false;
    return router?.pathname?.startsWith(path + '/');
  };

  const getActiveClass = (path) => {
    return isActiveRoute(path)
      ? "flex items-center space-x-2 p-2 bg-gradient-to-r from-red-600 to-yellow-600 text-white transition-colors rounded-lg shadow-sm my-1"
      : "flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 rounded-lg my-1";
  };

  // Define Sidebar Sections
  const sidebarSections = [
    {
      title: 'Overview',
      items: [
        { path: '/admin/dashboard', icon: MdDashboard, label: 'Dashboard', key: 'dashboard' }
      ]
    },
    {
      title: 'Communication',
      items: [
        { path: '/admin/notifications', icon: MdNotifications, label: 'Notifications', key: 'notifications' },
      ]
    },
    {
      title: 'Master Data',
      items: [
        { path: '/admin/categories', icon: MdCategory, label: 'Categories', key: 'categories' },
        { path: '/admin/subcategories', icon: MdLayers, label: 'Sub Categories', key: 'subcategories' },
        { path: '/admin/levels', icon: MdClass, label: 'Levels', key: 'levels' },
      ]
    },
    {
      title: 'Content Management',
      items: [
        { path: '/admin/quizzes', icon: MdQuiz, label: 'Quizzes', key: 'quizzes' },
        { path: '/admin/questions', icon: MdQuestionAnswer, label: 'Questions', key: 'questions' },
        { path: '/admin/articles', icon: MdArticle, label: 'Articles', key: 'articles' },
      ]
    },
    {
      title: 'Govt. Exams',
      items: [
        { path: '/admin/govt-exams', icon: MdCategory, label: 'Categories', key: 'govt-exams-categories' },
        { path: '/admin/govt-exams/exams', icon: MdSchool, label: 'Exams', key: 'govt-exams-exams' },
        { path: '/admin/govt-exams/patterns', icon: MdLayers, label: 'Patterns', key: 'govt-exams-patterns' },
        { path: '/admin/govt-exams/tests', icon: MdQuiz, label: 'Tests', key: 'govt-exams-tests' },
        { path: '/admin/govt-exams/results', icon: MdEmojiEvents, label: 'Results', key: 'govt-exams-results' },
      ]
    },
    {
      title: 'User Submissions',
      items: [
        { path: '/admin/user-questions', icon: MdQuestionAnswer, label: 'User Questions', key: 'user-questions' },
        { path: '/admin/user-quizzes', icon: MdQuiz, label: 'User Quizzes', key: 'user-quizzes' },
        { path: '/admin/user-blogs', icon: MdArticle, label: 'User Blogs', key: 'user-blogs' },
      ]
    },
    {
      title: 'User Management',
      items: [
        { path: '/admin/students', icon: MdPeople, label: 'Students', key: 'students' },
        { path: '/admin/user-details', icon: MdPerson, label: 'User Details', key: 'user-details' },
        { path: '/admin/prev-month-played-users', icon: MdPeople, label: 'Prev Played Users', key: 'prev-month-users' },
        { path: '/admin/contacts', icon: MdContactMail, label: 'Contacts', key: 'contacts' },
      ]
    },
    {
      title: 'Rewards & History',
      items: [
        { path: '/admin/referral-history', icon: MdHistory, label: 'Referral History', key: 'referral-history' },
        { path: '/admin/referral-analytics', icon: MdBarChart, label: 'Referral Analytics', key: 'referral-analytics' },
        { path: '/admin/blog-rewards-history', icon: MdEmojiEvents, label: 'Blog Rewards', key: 'blog-rewards' },
        { path: '/admin/quiz-rewards-history', icon: MdEmojiEvents, label: 'Quiz Rewards', key: 'quiz-rewards' },
        { path: '/admin/monthly-winners', icon: MdEmojiEvents, label: 'Winners', key: 'monthly-winners' },
        { path: '/admin/competition-resets', icon: MdSettingsBackupRestore, label: 'Manage Resets', key: 'competition-resets' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { path: '/admin/analytics/dashboard', icon: MdBarChart, label: 'Dashboard Analytics', key: 'analytics-dashboard' },
        { path: '/admin/analytics/users', icon: MdPeople, label: 'User Analytics', key: 'analytics-users' },
        { path: '/admin/analytics/users-overview', icon: MdAnalytics, label: 'All Users Analytics', key: 'analytics-users-overview' },
        { path: '/admin/analytics/quizzes', icon: MdQuiz, label: 'Quiz Analytics', key: 'analytics-quizzes' },
        { path: '/admin/analytics/financial', icon: MdTrendingUp, label: 'Financial Analytics', key: 'analytics-financial' },
        { path: '/admin/analytics/performance', icon: MdAnalytics, label: 'Performance Analytics', key: 'analytics-performance' },

      ]
    },
    {
      title: 'Finance & Wallets',
      items: [
        { path: '/admin/user-wallets', icon: MdAccountBalance, label: 'User Wallets', key: 'user-wallets' },
        { path: '/admin/withdraw-requests', icon: MdMoneyOff, label: 'Withdraw Requests', key: 'withdraw-requests' },
        { path: '/admin/bank-details', icon: MdAssignment, label: 'Bank Details', key: 'bank-details' },
        { path: '/admin/payment-transactions', icon: MdTrendingUp, label: 'Transactions', key: 'transactions' },
        { path: '/admin/subscriptions', icon: MdCardGiftcard, label: 'Subscriptions', key: 'subscriptions' },
        { path: '/admin/expenses', icon: MdMoneyOff, label: 'Platform Expenses', key: 'platform-expenses' },
      ]
    },

  ];

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  if (!isAdmin() || !hasAdminPrivileges()) return null;

  return (
    <div className={`sidebar bg-white dark:bg-gray-900 dark:text-white text-gray-900 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full shadow-lg border-r border-gray-200 dark:border-gray-800`}>

      {/* Scrollable Navigation Area */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <div className="space-y-3 px-2">
          {sidebarSections.map((section, idx) => (
            <div key={idx}>
              {/* Section Title */}
              <div className="px-2 mb-2">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.key}
                      href={item.path}
                      onClick={() => handleNavClick(item.key)}
                      className={getActiveClass(item.path)}
                    >
                      <Icon className={`text-xl ${isActiveRoute(item.path) ? 'text-white font-normal' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className={`text-md ${isActiveRoute(item.path) ? 'text-white font-normal' : 'text-gray-500 dark:text-gray-400'}`}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Logout Button (Fixed at bottom) */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button
          onClick={() => secureLogout(router)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 text-white text-sm bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 pointer-events-auto"
        >
          <MdLogout className="text-xl" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;