'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import {
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
  IndianRupee,
  X,
  PlayCircle,
  Heart,
  Bell,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useClientSide, useAuthStatus } from '../../hooks/useClientSide';
import { secureLogout } from '../../lib/utils/authUtils';
import { toggleDarkMode, initializeDarkMode } from '../../store/darkModeSlice';
import { toggleSidebar } from '../../lib/store/sidebarSlice';
import API from '../../lib/api';
import Image from "next/image";

const StudentNavbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isClient = useClientSide();
  const { user } = useAuthStatus();
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const isSidebarOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isClient) dispatch(initializeDarkMode());
  }, [isClient, dispatch]);

  useEffect(() => {
    if (!isClient || !user) return;
    let cancelled = false;
    API.getUnreadNotificationCount()
      .then(res => { if (!cancelled) setUnreadCount(res?.pagination?.total || 0); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isClient, user, router.pathname]);

  const toggleTheme = () => dispatch(toggleDarkMode());
  const handleLogout = () => secureLogout(router);

  if (!isClient || !user) return null;

  // subscriptionStatus isn't downgraded server-side when the subscription
  // lapses (known backend gap) — check expiry here too so the badge doesn't
  // claim active PRO after it's expired.
  const rawPlan = (user.subscriptionStatus || 'FREE').toUpperCase();
  const isExpired = rawPlan === 'PRO' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) <= new Date();
  const plan = isExpired ? 'EXPIRED' : rawPlan;
  const planBadgeClassWeb = `absolute top-2 right-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${isExpired ? 'bg-red-500 text-white' : 'bg-primary-600 text-white'}`;
  const planBadgeClassMobile = `absolute top-1 -right-[45px] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${isExpired ? 'bg-red-500 text-white' : 'bg-primary-600 text-white'}`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[150] h-12 lg:h-16 bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 flex items-center">
        <div className="w-full mx-auto px-2 lg:px-4 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger — desktop only (mobile version sits at the right end) */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isSidebarOpen}
              className={`hidden lg:flex w-12 h-12 rounded-xl xl:rounded-2xl items-center justify-center transition-all active:scale-95 ${isSidebarOpen
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-primary-600 text-white shadow-sm hover:scale-105'
                }`}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo — desktop */}
            <Link href="/home" className="relative hidden lg:flex items-start gap-1">
              <span className="flex flex-col leading-none">
                <span className="text-2xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                  AAJ<span className="text-primary-600">EXAM</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.1em] uppercase mt-0.5">
                  Prepare Your Exam Today
                </span>
              </span>
              <span className={planBadgeClassWeb}>{plan}</span>
            </Link>

            {/* Logo — mobile, smaller, left-aligned */}
            <Link href="/home" className="relative lg:hidden flex items-center gap-1.5 shrink-0">
              <span className="text-xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                AAJ<span className="text-primary-600">EXAM</span>
              </span>
              <span className={planBadgeClassMobile}>{plan}</span>
            </Link>
          </div>

          {/* Center — logged-in user's name on desktop */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
            <span className="uppercase text-lg font-black text-slate-700 dark:text-slate-300 truncate max-w-xs">
              Welcome back, <span className="text-primary-600">{user.name}</span>
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Notifications */}
            <Link
              href="/notifications"
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
              className="relative flex w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500 hover:text-primary-600 transition-all flex-shrink-0"
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary-600 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500 hover:text-primary-600 transition-all flex-shrink-0"
            >
              {darkMode ? <Sun className="w-4 h-4 lg:w-5 lg:h-5" /> : <Moon className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>

            {/* Profile avatar — plan (PRO/FREE/EXPIRED) now shown as a
                badge next to the logo instead of floating on the avatar. */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label={`${plan} plan – Profile menu`}
              aria-expanded={showProfileMenu}
              title={isExpired ? 'PRO plan expired' : `${plan} plan`}
              className="p-0.5 rounded-full"
            >
              <div className="relative w-8 h-8 lg:w-10 lg:h-10">
                <div className="w-full h-full rounded-full overflow-hidden p-[2px]">
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.name || 'Profile'}
                      width={36}
                      height={36}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full border border-y-black dark:border-y-white rounded-full flex items-center justify-center text-slate-900 dark:text-white text-xs font-black uppercase`}
                    >
                      {user.name?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* Hamburger — mobile only, right end */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isSidebarOpen}
              className={`lg:hidden flex w-8 h-8 rounded-lg items-center justify-center transition-all active:scale-95 flex-shrink-0 ${isSidebarOpen
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
              className="fixed top-12 lg:top-16 right-3 lg:right-8 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm z-[170]"
            >
              {/* User info */}
              <div className="px-3 py-2.5 mb-1 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-slate-800/50">

                <p className="text-[12px] text-slate-400 truncate">{user.email}</p>
              </div>

              {[
                { label: 'Profile', icon: User, path: '/profile' },
                { label: 'Referral Rewards', icon: Gift, path: '/referral-history', showBalance: true },
                { label: 'Settings', icon: Settings, path: '/settings' },
              ].map(item => (
                <Link key={item.path} href={item.path} onClick={() => setShowProfileMenu(false)}>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg lg:rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <item.icon className="w-4 h-4 text-slate-400" /> {item.label}
                    {item.showBalance && (
                      <span className="ml-auto text-sm font-black text-primary-600 flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />{user.walletBalance || 0}
                      </span>
                    )}
                  </button>
                </Link>
              ))}

              {/* Theme toggle — mobile only */}
              <button
                onClick={() => { toggleTheme(); setShowProfileMenu(false); }}
                className="lg:hidden w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg lg:rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
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

export default StudentNavbar;
