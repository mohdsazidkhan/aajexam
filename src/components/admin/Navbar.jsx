'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  Filter,
  UserCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/sidebarSlice';
import { toggleDarkMode, initializeDarkMode } from '../../store/darkModeSlice';
import { secureLogout, getCurrentUser } from '../../lib/utils/authUtils';
import { useSSR } from '../../hooks/useSSR';
import { useAdminMobileHeaderContext } from '../../contexts/AdminMobileHeaderContext';

const AdminNavbar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);
  const darkMode = useSelector((state) => state.darkMode.isDark);
  const user = getCurrentUser();
  const { header, setDrawerOpen } = useAdminMobileHeaderContext();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (isMounted) {
      dispatch(initializeDarkMode());
    }
  }, [isMounted, dispatch]);

  if (!isMounted) return null;

  const toggleTheme = () => dispatch(toggleDarkMode());
  const handleLogout = () => secureLogout(router);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[150] h-12 lg:h-16 bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 flex items-center">
        <div className="w-full mx-auto px-2 lg:px-4 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-2 lg:gap-4 min-w-0 flex-1">
            {/* Hamburger — desktop only (mobile version sits at the right end) */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isSidebarOpen}
              className={`hidden lg:flex w-12 h-12 rounded-xl xl:rounded-2xl items-center justify-center transition-all active:scale-95 shrink-0 ${
                isSidebarOpen
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-primary-600 text-white shadow-sm hover:scale-105'
              }`}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo — desktop */}
            <Link href="/admin/dashboard" className="hidden lg:flex items-center shrink-0">
              <span className="text-2xl lg:text-3xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white text-slate-900 dark:text-white">
                AAJ<span className="text-primary-600">EXAM</span>
              </span>
            </Link>

            {/* Logo — mobile, smaller, left-aligned */}
            <Link href="/admin/dashboard" className="lg:hidden flex items-center shrink-0">
              <span className="text-base font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                AAJ<span className="text-primary-600">EXAM</span>
              </span>
            </Link>

            {/* Page title + count — shown right after the logo (web + mobile) */}
            {header.title && (
              <div className="flex items-center gap-1 lg:gap-2 min-w-0 pl-2 lg:pl-4 ml-0 lg:ml-1 border-l border-slate-200 dark:border-slate-700">
                <span className="text-sm lg:text-lg font-black text-slate-900 dark:text-white truncate">{header.title}</span>
                {header.count !== null && header.count !== undefined && (
                  <span className="text-xs lg:text-sm font-bold text-slate-400 dark:text-slate-500 shrink-0">({header.count})</span>
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
            {/* Filter — opens the drawer with this page's search/filters (web + mobile) */}
            {header.filters && (
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open filters"
                className="flex w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500 hover:text-primary-600 transition-all flex-shrink-0"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Theme toggle — desktop only (mobile keeps it in the profile menu) */}
            <button
              onClick={toggleTheme}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hidden lg:flex w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500 hover:text-primary-600 transition-all flex-shrink-0"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Profile avatar */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="Profile menu"
              aria-expanded={showProfileMenu}
              className="p-0.5 rounded-full flex-shrink-0"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden bg-primary-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white text-[10px] font-black uppercase">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
            </button>

            {/* Hamburger — mobile only, right end */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isSidebarOpen}
              className={`lg:hidden flex w-8 h-8 rounded-lg items-center justify-center transition-all active:scale-95 flex-shrink-0 ${
                isSidebarOpen
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-primary-600 text-white shadow-sm'
              }`}
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Profile Menu Dropdown */}
      <AnimatePresence>
        {showProfileMenu && (
          <>
            <div className="fixed inset-0 z-[160]" onClick={() => setShowProfileMenu(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              role="menu"
              className="fixed top-12 lg:top-16 right-3 lg:right-8 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm z-[170]"
            >
              {/* User info */}
              <div className="px-3 py-2.5 mb-1 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-[12px] text-slate-400 truncate">{user?.email || ''}</p>
              </div>

              {/* Admin badge — mobile */}
              <div className="lg:hidden flex items-center gap-2.5 px-3 py-2.5 rounded-lg lg:rounded-xl bg-primary-50 dark:bg-primary-900/10 mb-1">
                <ShieldCheck className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">Admin Panel</span>
              </div>

              {[
                { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
                { label: 'Profile', icon: UserCircle, path: '/admin/profile' },
              ].map(item => (
                <Link key={item.path} href={item.path} onClick={() => setShowProfileMenu(false)}>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg lg:rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <item.icon className="w-4 h-4 text-slate-400" /> {item.label}
                  </button>
                </Link>
              ))}

              {/* Theme toggle */}
              <button
                onClick={() => { toggleTheme(); setShowProfileMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg lg:rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {darkMode ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800 mx-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg lg:rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminNavbar;
