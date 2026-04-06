'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { secureLogout, getCurrentUser } from '../lib/utils/authUtils';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../lib/store/sidebarSlice';
import { toggleDarkMode, initializeDarkMode } from '../store/darkModeSlice';
import ScrollToTopButton from './ScrollToTopButton';
import { useSSR } from '../hooks/useSSR';

const AdminMobileAppWrapper = ({ children, title, showHeader = true }) => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = getCurrentUser();
  const dispatch = useDispatch();
  const { isOpen } = useSelector((state) => state.sidebar);
  const darkMode = useSelector((state) => state.darkMode.isDark);

  useEffect(() => {
    if (isMounted) {
      dispatch(initializeDarkMode());
    }
  }, [isMounted, dispatch]);

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-pulse" />;
  }

  const toggleTheme = () => dispatch(toggleDarkMode());

  const getPageName = () => {
    if (title) return title;
    if (!isRouterReady || !router) return 'Admin Panel';

    const path = router.pathname;
    const pathSegments = path.split('/').filter(Boolean);
    const pageNames = {
      'admin': 'Admin',
      'dashboard': 'Dashboard',
      'analytics': 'Analytics',
      'users': 'Users',
      'students': 'Students',
      'categories': 'Categories',
      'subcategories': 'Subcategories',
      'quizzes': 'Quizzes',
      'questions': 'Questions',
      'contacts': 'Contacts',
      'bank-details': 'Bank Details',
      'monthly-winners': 'Monthly Winners',
      'financial': 'Financial',
      'performance': 'Performance'
    };

    const lastSegment = pathSegments[pathSegments.length - 1];
    return pageNames[lastSegment] || 'Admin';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'} transition-colors duration-500 font-outfit`}>
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-[110] lg:hidden h-20 bg-white/90 dark:bg-[#0A0F1E]/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 shadow-xl px-4 flex items-center justify-between overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.04] pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10 transition-transform active:scale-95">
            <Link href="/admin/dashboard" className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-0.5 shadow-duo-primary">
              <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center text-white text-sm font-black italic">A</div>
            </Link>
            <div className="flex flex-col">
              <h1 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">
                {getPageName()}
              </h1>
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-primary-500/60 leading-none mt-1">Admin Panel</span>
            </div>
          </div>

          <div className="font-outfit">
            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.9, y: 1 }}
              onClick={toggleTheme}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border-b-4 transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* Logout */}
            {user && (
              <motion.button
                whileTap={{ scale: 0.9, y: 1 }}
                onClick={() => secureLogout(router)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500 border-b-4 border-rose-700 text-white shadow-lg shadow-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}

            {/* Sidebar Toggle */}
            <motion.button
              whileTap={{ scale: 0.9, y: 1 }}
              onClick={() => dispatch(toggleSidebar())}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border-b-4 transition-all ${isOpen ? 'bg-primary-600 border-primary-800' : 'bg-primary-500 border-primary-700'
                } text-white shadow-lg shadow-primary-500/20`}
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.button>
          </div>
        </header>
      )}

      <main className="admin-mobile-content min-h-screen">
        {children}
      </main>

      <ScrollToTopButton />
    </div>
  );
};

export default AdminMobileAppWrapper;


