import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { FaSignOutAlt, FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';
import { secureLogout, getCurrentUser } from '../lib/utils/authUtils';
import { toggleDarkMode, initializeDarkMode } from '../store/darkModeSlice';
import { toggleSidebar } from '../lib/store/sidebarSlice';
import ScrollToTopButton from './ScrollToTopButton';
import UnifiedNavbar from './UnifiedNavbar';

const MobileAppWrapper = ({ children, title, showHeader = true }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const darkMode = useSelector((state) => state.darkMode.isDark);
  const isOpen = useSelector((state) => state.sidebar?.isOpen ?? false);

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);

    // Initialize dark mode
    dispatch(initializeDarkMode());

    // Safely get user after component mounts
    setUser(getCurrentUser());
  }, [dispatch]);

  const toggleTheme = () => dispatch(toggleDarkMode());
  const toggleSidebarMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleSidebar());
  };

  // Don't apply mobile wrapper on admin pages only
  const isAdminPage = router.pathname?.startsWith('/admin');

  // Function to get page name based on current route
  const getPageName = () => {
    if (title) return title;

    const path = router.pathname;

    // Return default if pathname is null
    if (!path) return 'AajExam';

    const pageNames = {
      '/': 'AajExam',
      '/login': 'Login',
      '/register': 'Register',
      '/forgot-password': 'Forgot Password',
      '/reset-password': 'Reset Password',
      '/home': 'Home',
      '/search': 'Search',
      '/rewards': 'Rewards',
      '/subscription': 'Subscription',
      '/profile': 'Profile',
      '/levels': 'Levels',
      '/level-quizzes': 'Level Quizzes',
      '/category': 'Category',
      '/subcategory': 'Subcategory',
      '/level': 'Level',
      '/attempt-quiz': 'Quiz',
      '/quiz-result': 'Result',
      '/how-it-works': 'How It Works',
      '/about': 'About Us',
      '/terms': 'Terms',
      '/privacy': 'Privacy',
      '/refund': 'Refund',
      '/contact': 'Contact'
    };

    // Check for exact matches first
    if (pageNames[path]) {
      return pageNames[path];
    }

    // Check for dynamic routes
    if (path.startsWith('/category/')) return 'Category';
    if (path.startsWith('/subcategory/')) return 'Subcategory';
    if (path.startsWith('/level/')) return 'Level';
    if (path.startsWith('/attempt-quiz/')) return 'Quiz';

    // Default fallback
    return 'AajExam';
  };

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-app-container">
      {/* Desktop Navbar for Public Pages - Use same navbar as ModernLandingPage */}
      {/* Only render when showHeader is true to avoid duplicate on landing page (which has showHeader={false}) */}
      {showHeader && <UnifiedNavbar isLandingPage={true} />}

      {showHeader && (
        <div className="mobile-app-header fixed top-0 left-0 right-0 z-50 md:hidden !bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 !border-b !border-gray-200 dark:!border-gray-700">
          <div className="flex items-center justify-between px-2">
            {/* Left side - Sidebar Toggle (only when logged in) and Logo */}
            <div className="flex items-center space-x-2">
              {/* Sidebar Toggle Button - Only show when user is logged in */}
              {isClient && user && (
                <button
                  type="button"
                  onClick={toggleSidebarMenu}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 ${darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  title={isOpen ? "Hide Sidebar" : "Show Sidebar"}
                  aria-label={isOpen ? "Hide Sidebar" : "Show Sidebar"}
                >
                  {!isOpen ? <FaBars className="w-4 h-4" /> : <FaTimes className="w-4 h-4" />}
                </button>
              )}
              {/* Logo */}
              <Link
                href={user ? '/home' : '/'}
                className="flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
              >
                <img
                  src="/logo.png"
                  alt="AajExam Logo"
                  className="w-12 h-12 object-contain"
                />
              </Link>
            </div>

            {/* Page name in the center */}
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white flex-1 text-center">
              {getPageName()?.length > 20 ? getPageName()?.slice(0, 20) + '...' : getPageName()}
            </h1>

            {/* Right side - Theme toggle and Logout button */}
            <div className="flex items-center space-x-1">
              {isClient ? (
                <button
                  onClick={toggleTheme}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:scale-105"
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
                </button>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              )}

              {user ? (
                <button
                  onClick={() => secureLogout(router)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-105 shadow-md"
                  title="Logout"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mobile-content">
        {children}
      </div>

      {/* Scroll to Top Button - Only show on mobile */}
      <ScrollToTopButton />
    </div>
  );
};

export default MobileAppWrapper;
