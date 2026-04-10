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
  Flame,
  Zap,
  TrendingUp,
  Award,
  Menu,
  IndianRupee,
  X,
  PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useClientSide, useAuthStatus } from '../../hooks/useClientSide';
import { secureLogout } from '../../lib/utils/authUtils';
import { toggleDarkMode, initializeDarkMode } from '../../store/darkModeSlice';
import { toggleSidebar } from '../../lib/store/sidebarSlice';
import Image from "next/image";

const StudentNavbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isClient = useClientSide();
  const { user } = useAuthStatus();
  const isSidebarOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isClient) {
      dispatch(initializeDarkMode());
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isClient, dispatch]);

  const toggleTheme = () => dispatch(toggleDarkMode());
  const handleLogout = () => secureLogout(router);

  if (!isClient || !user) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[150] h-16 lg:h-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 shadow-xl flex items-center">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1920px] flex items-center justify-between gap-4">

          {/* --- Left: Toggle & Logo --- */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-duo-primary hover:scale-105 active:scale-95 transition-all"
            >
              {isSidebarOpen ? <X className="w-5 h-5 lg:w-6 lg:h-6" /> : <Menu className="w-5 h-5 lg:w-6 lg:h-6" />}
            </button>

            <Link href="/home" className="flex items-center gap-3 group">
              <span className="block text-xl lg:text-2xl font-black font-outfit uppercase tracking-tighter text-content-primary">
                AAJ<span className="text-primary-600">EXAM</span>
              </span>
            </Link>
          </div>

          {/* --- Right: Stats & Profile --- */}
          <div className="flex items-center gap-2 lg:gap-6">

            {/* Stats: Wallet */}
            <motion.div
              whileHover={{ y: -2 }}
              className="flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 bg-amber-500/10 dark:bg-amber-500/5 rounded-2xl border border-amber-500/20 text-amber-600 dark:text-amber-500"
            >
              <IndianRupee className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-sm font-black font-outfit tracking-tight">{user.walletBalance || 0}</span>
            </motion.div>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-content-secondary hover:text-primary-500 transition-all border border-slate-200/50 dark:border-slate-700/50"
            >
              {darkMode ? <Sun className="w-5" /> : <Moon className="w-5" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900/30 border-2 border-white dark:border-slate-800">
                  {user.profilePicture ? (
                    <Image src={user.profilePicture} alt="User" width={36} height={36} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-600 font-bold uppercase">{user.name?.charAt(0)}</div>
                  )}
                </div>
                <ChevronDown className={`w-4 text-slate-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-background-surface border border-border-primary rounded-[2rem] p-3 shadow-2xl z-[110]"
                  >
                    <div className="p-4 mb-2 rounded-[2rem] bg-background-surface-secondary border border-border-primary/50">
                      <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Authenticated</p>
                      <p className="text-sm font-black text-content-primary truncate">{user.email}</p>
                    </div>

                    <Link href="/profile" onClick={() => setShowProfileMenu(false)}>
                      <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black text-content-secondary hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-500 transition-all group uppercase">
                        <User className="w-4 h-4 group-hover:scale-110" /> Profile
                      </button>
                    </Link>

                    <Link href="/reels" onClick={() => setShowProfileMenu(false)}>
                      <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black text-content-secondary hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-500 transition-all group uppercase">
                        <PlayCircle className="w-4 h-4 group-hover:scale-110" /> Reels
                      </button>
                    </Link>

                    <Link href="/settings" onClick={() => setShowProfileMenu(false)}>
                      <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black text-content-secondary hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-500 transition-all group uppercase">
                        <Settings className="w-4 h-4 group-hover:rotate-45" /> Settings
                      </button>
                    </Link>

                    <div className="my-2 border-t border-slate-100 dark:border-slate-800 mx-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black text-red-500 hover:bg-red-500/10 transition-all group uppercase"
                    >
                      <LogOut className="w-4 h-4 group-hover:-translate-x-1" /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {showProfileMenu && (
        <div className="fixed inset-0 z-[80]" onClick={() => setShowProfileMenu(false)} />
      )}
    </>
  );
};

export default StudentNavbar;

