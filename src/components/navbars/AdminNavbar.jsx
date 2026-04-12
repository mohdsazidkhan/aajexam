'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Settings,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/sidebarSlice';
import { toggleDarkMode, initializeDarkMode } from '../../store/darkModeSlice';
import { secureLogout, getCurrentUser, getAuthToken } from '../../lib/utils/authUtils';
import { useSSR } from '../../hooks/useSSR';
import API from '../../lib/api';

const AdminNavbar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);
  const darkMode = useSelector((state) => state.darkMode.isDark);
  const user = getCurrentUser();

  const [notifCount, setNotifCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (isMounted) {
      dispatch(initializeDarkMode());
    }
  }, [isMounted, dispatch]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const resCount = await API.getAdminNotifications(1, 1, { unreadOnly: true });
        const total = resCount?.pagination?.total || (resCount?.data?.length || 0);
        setNotifCount(total);
      } catch (err) {
        console.error('Error fetching notification count:', err);
      }
    };
    if (isMounted) fetchCount();
  }, [isMounted]);

  if (!isMounted) return null;

  const toggleTheme = () => dispatch(toggleDarkMode());
  const handleLogout = () => secureLogout(router);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[150] h-12 lg:h-20 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/50 flex items-center">
        <div className="w-full mx-auto px-4 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-2 w-10 lg:w-auto">
            {/* Hamburger */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isSidebarOpen}
              className={`w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                isSidebarOpen
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-transparent lg:bg-primary-500 text-slate-700 dark:text-slate-300 lg:text-white lg:shadow-duo-primary lg:hover:scale-105'
              }`}
            >
              {isSidebarOpen ? <X className="w-5 h-5 lg:w-6 lg:h-6" /> : <Menu className="w-5 h-5 lg:w-6 lg:h-6" />}
            </button>

            {/* Logo — desktop only */}
            <Link href="/admin/dashboard" className="hidden lg:flex items-center">
              <span className="text-2xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                AAJ<span className="text-primary-600">EXAM</span>
              </span>
            </Link>
          </div>

          {/* Center — Logo on mobile */}
          <Link href="/admin/dashboard" className="lg:hidden absolute left-1/2 -translate-x-1/2">
            <span className="text-lg font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
              AAJ<span className="text-primary-600">EXAM</span>
            </span>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-1.5 lg:gap-4">
            {/* Theme toggle — desktop only */}
            <button
              onClick={toggleTheme}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hidden lg:flex w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500 hover:text-primary-500 transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Badge — desktop only */}
            <Link href="/admin/notifications" className="relative hidden lg:block">
              <button className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-500/10 hover:text-primary-500 transition-all border border-slate-200/50 dark:border-white/5">
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-pulse">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Profile avatar */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="Profile menu"
              aria-expanded={showProfileMenu}
              className="p-0.5 rounded-full"
            >
              <div className="w-8 h-8 lg:w-11 lg:h-11 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-indigo-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white text-xs font-black uppercase">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
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
              className="fixed top-12 lg:top-20 right-3 lg:right-8 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl z-[170]"
            >
              {/* User info */}
              <div className="px-3 py-2.5 mb-1 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
              </div>

              {/* Admin badge — mobile */}
              <div className="lg:hidden flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Admin Panel</span>
              </div>

              {/* Notifications — mobile */}
              <Link href="/admin/notifications" onClick={() => setShowProfileMenu(false)} className="lg:hidden">
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  <Bell className="w-4 h-4 text-slate-400" /> Notifications
                  {notifCount > 0 && (
                    <span className="ml-auto w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </button>
              </Link>

              {[
                { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
              ].map(item => (
                <Link key={item.path} href={item.path} onClick={() => setShowProfileMenu(false)}>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <item.icon className="w-4 h-4 text-slate-400" /> {item.label}
                  </button>
                </Link>
              ))}

              {/* Theme toggle — mobile only */}
              <button
                onClick={() => { toggleTheme(); setShowProfileMenu(false); }}
                className="lg:hidden w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {darkMode ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800 mx-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
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
