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
  ChevronDown,
  LayoutDashboard,
  Zap,
  Activity,
  ShieldCheck
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
    <header className="fixed top-0 left-0 right-0 z-[150] h-16 lg:h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5 shadow-xl flex items-center">
      <div className="max-w-[1920px] mx-auto w-full px-4 lg:px-8 flex items-center justify-between gap-4">

        {/* --- Left: Admin Logo & Brand --- */}
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center group gap-3">
             <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary-500 rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-duo-primary group-hover:rotate-6 transition-transform">
               <ShieldCheck className="w-6 h-6 lg:w-7 lg:h-7" />
             </div>
             <div className="hidden sm:flex flex-col">
               <span className="text-lg lg:text-xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                 ADMIN <span className="text-primary-700 dark:text-primary-500">DASHBOARD</span>
               </span>
               <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-primary-500/60 leading-none mt-1">AAJEXAM SYSTEM</span>
             </div>
          </Link>
        </div>

        {/* --- Right: Actions --- */}
        <div className="flex items-center gap-2 lg:gap-6">

          {/* Theme Toggle */}
          <button
             onClick={toggleTheme}
             className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-slate-900/50 flex items-center justify-center text-amber-500 hover:bg-amber-500/10 transition-all border border-slate-200/50 dark:border-white/5"
          >
             {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notification Badge */}
          <Link href="/admin/notifications" className="relative">
             <button className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-500/10 hover:text-primary-500 transition-all border border-slate-200/50 dark:border-white/5">
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-pulse">
                      {notifCount > 9 ? '9+' : notifCount}
                   </span>
                )}
             </button>
          </Link>

          {/* Sidebar Toggle */}
          <button
             onClick={() => dispatch(toggleSidebar())}
             className="w-10 h-10 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-duo-primary hover:scale-105 transition-transform"
          >
             {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden lg:block" />

          {/* Operator Profile */}
          <div className="flex items-center gap-4 pl-2">
             <div className="text-right hidden xl:block">
                <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest leading-none mb-1">ROLE: ADMIN</p>
               <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">
                 {user?.name?.split(' ')[0] || 'ADMIN'}
               </p>
             </div>
             <button
               onClick={handleLogout}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all group"
             >
               <LogOut className="w-5 h-5 lg:w-6 lg:h-6 group-hover:-translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;

