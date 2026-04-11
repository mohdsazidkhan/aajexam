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
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useClientSide, useAuthStatus } from '../../hooks/useClientSide';
import { secureLogout } from '../../lib/utils/authUtils';
import { toggleDarkMode, initializeDarkMode } from '../../store/darkModeSlice';
import { toggleSidebar } from '../../lib/store/sidebarSlice';
import Image from "next/image";

// Pages that show hamburger menu on mobile
const HAMBURGER_PAGES = ['/home', '/govt-exams', '/profile', '/community-questions'];

const StudentNavbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isClient = useClientSide();
  const { user } = useAuthStatus();
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const isSidebarOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const showHamburger = HAMBURGER_PAGES.some(p => router.pathname === p || router.pathname.startsWith(p + '/'));

  useEffect(() => {
    if (isClient) dispatch(initializeDarkMode());
  }, [isClient, dispatch]);

  const toggleTheme = () => dispatch(toggleDarkMode());
  const handleLogout = () => secureLogout(router);

  if (!isClient || !user) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[150] h-12 lg:h-20 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/50 flex items-center">
        <div className="w-full px-3 lg:px-8 max-w-[1920px] mx-auto flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-2 w-10 lg:w-auto">
            {/* Hamburger — mobile: only on specific pages, desktop: always */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className={`w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                showHamburger ? 'flex' : 'hidden lg:flex'
              } ${isSidebarOpen
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : 'bg-transparent lg:bg-primary-500 text-slate-700 dark:text-slate-300 lg:text-white lg:shadow-duo-primary lg:hover:scale-105'
              }`}
            >
              {isSidebarOpen ? <X className="w-5 h-5 lg:w-6 lg:h-6" /> : <Menu className="w-5 h-5 lg:w-6 lg:h-6" />}
            </button>

            {/* Logo — desktop only (left-aligned) */}
            <Link href="/home" className="hidden lg:flex items-center">
              <span className="text-2xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                AAJ<span className="text-primary-600">EXAM</span>
              </span>
            </Link>
          </div>

          {/* Center — Logo on mobile */}
          <Link href="/home" className="lg:hidden absolute left-1/2 -translate-x-1/2">
            <span className="text-lg font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
              AAJ<span className="text-primary-600">EXAM</span>
            </span>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-1.5 lg:gap-4">
            {/* Wallet — desktop only in navbar */}
            <div className="hidden lg:flex items-center gap-1 px-4 py-2 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-600 dark:text-amber-500">
              <IndianRupee className="w-4 h-4" />
              <span className="text-sm font-black">{user.walletBalance || 0}</span>
            </div>

            {/* Theme toggle — desktop only */}
            <button
              onClick={toggleTheme}
              className="hidden lg:flex w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500 hover:text-primary-500 transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile avatar */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-0.5 rounded-full"
            >
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-pink-500 p-[2px]">
                {user.profilePicture ? (
                  <Image src={user.profilePicture} alt="User" width={36} height={36} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white text-xs font-black uppercase">
                    {user.name?.charAt(0)}
                  </div>
                )}
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
              className="fixed top-12 lg:top-20 right-3 lg:right-8 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl z-[170]"
            >
              {/* User info */}
              <div className="px-3 py-2.5 mb-1 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>

              {/* Wallet — mobile only (in dropdown) */}
              <div className="lg:hidden flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 mb-1">
                <Wallet className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Balance</span>
                <span className="ml-auto text-sm font-black text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                  <IndianRupee className="w-3 h-3" />{user.walletBalance || 0}
                </span>
              </div>

              {[
                { label: 'Profile', icon: User, path: '/profile' },
                { label: 'Reels', icon: PlayCircle, path: '/reels' },
                { label: 'Settings', icon: Settings, path: '/settings' },
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

export default StudentNavbar;
