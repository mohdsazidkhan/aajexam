import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { FaSignOutAlt, FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';

import { secureLogout, getCurrentUser } from '../lib/utils/authUtils';
import { toggleDarkMode, initializeDarkMode } from '../store/darkModeSlice';
import { toggleSidebar } from '../lib/store/sidebarSlice';
import ScrollToTopButton from './ScrollToTopButton';
import PublicNavbar from './navbars/PublicNavbar';
import PublicBottomNav from './navbars/PublicBottomNav';
import UnifiedFooter from './UnifiedFooter';

const MobileAppWrapper = ({ children, title, showHeader = true }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const darkMode = useSelector((state) => state.darkMode.isDark);
  const isOpen = useSelector((state) => state.sidebar?.isOpen ?? false);

  useEffect(() => {
    setIsClient(true);
    dispatch(initializeDarkMode());
    setUser(getCurrentUser());
  }, [dispatch]);

  const toggleTheme = () => dispatch(toggleDarkMode());

  const toggleSidebarMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleSidebar());
  };

  const isAdminPage = router.pathname?.startsWith('/admin');

  const getPageName = () => {
    if (title) return title;

    const path = router.pathname;
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

    if (pageNames[path]) {
      return pageNames[path];
    }

    if (path.startsWith('/category/')) return 'Category';
    if (path.startsWith('/subcategory/')) return 'Subcategory';
    if (path.startsWith('/level/')) return 'Level';
    if (path.startsWith('/attempt-quiz/')) return 'Quiz';

    return 'AajExam';
  };

  if (isAdminPage) {
    return <>{children}</>;
  }

  const pageName = getPageName();

  return (
    <div className="mobile-app-container min-h-screen bg-white dark:bg-slate-950">
      {showHeader && (
        <PublicNavbar />
      )}

      <main className={`mobile-content`}>
        {children}
      </main>

      <UnifiedFooter />
      <PublicBottomNav />
      <ScrollToTopButton />
    </div>
  );
};

export default MobileAppWrapper;

