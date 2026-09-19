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

// Pages that hide the hamburger menu. Empty by default — every page
// (including /search and /reels) now keeps the hamburger so the user
// can always toggle the desktop sidebar without leaving the page.
const HIDE_HAMBURGER_PAGES = [];

const StudentNavbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isClient = useClientSide();
  const { user } = useAuthStatus();
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const isSidebarOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const showHamburger = !HIDE_HAMBURGER_PAGES.includes(router.pathname);

  useEffect(() => {
    if (isClient) dispatch(initializeDarkMode());
  }, [isClient, dispatch]);

  const toggleTheme = () => dispatch(toggleDarkMode());
  const handleLogout = () => secureLogout(router);

  if (!isClient || !user) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[150] h-12 lg:h-16 bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 flex items-center">
        <div className="w-full mx-auto px-4 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-2 w-10 lg:w-auto">
            {/* Hamburger — mobile: only on specific pages, desktop: always */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isSidebarOpen}
              className={`w-9 h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl lg:rounded-2xl flex items-center justify-center transition-all active:scale-95 ${showHamburger ? 'flex' : 'hidden lg:flex'
                } ${isSidebarOpen
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-transparent lg:bg-primary-700 text-slate-700 dark:text-slate-300 lg:text-white lg:shadow-sm lg:hover:scale-105'
                }`}
            >
              {isSidebarOpen ? <X className="w-5 h-5 lg:w-6 lg:h-6" /> : <Menu className="w-5 h-5 lg:w-6 lg:h-6" />}
            </button>

            {/* Logo — desktop only (left-aligned) */}
            <Link href="/home" className="hidden lg:flex flex-col leading-none">
              <span className="text-2xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                AAJ<span className="text-primary-700">EXAM</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.1em] uppercase mt-0.5">
                Prepare Your Exam Today
              </span>
            </Link>
          </div>

          {/* Center — Logo on mobile, logged-in user's name on desktop */}
          <Link href="/home" className="lg:hidden absolute left-1/2 -translate-x-1/2">
            <span className="text-2xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
              AAJ<span className="text-primary-700">EXAM</span>
            </span>
          </Link>
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
            <span className="uppercase text-lg font-black text-slate-700 dark:text-slate-300 truncate max-w-xs">
              Welcome back, <span className="text-primary-700">{user.name}</span>
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Wallet — desktop only in navbar */}
            <div className="hidden lg:flex items-center gap-1 px-4 py-2 bg-black/10 dark:bg-white/10 rounded-2xl border border-black/20 dark:border-white/20 text-black dark:text-white">
              <IndianRupee className="w-4 h-4" />
              <span className="text-sm font-black">{user.walletBalance || 0}</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-500 hover:text-primary-700 transition-all flex-shrink-0"
            >
              {darkMode ? <Sun className="w-4 h-4 lg:w-5 lg:h-5" /> : <Moon className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>

            {/* Profile avatar — colour-codes the plan: PRO = gold ring +
                gold avatar; FREE = green ring + green avatar. The user's
                first initial sits inside in white. */}
            {(() => {
              const rawPlan = (user.subscriptionStatus || 'FREE').toUpperCase();
              // subscriptionStatus isn't downgraded server-side when the
              // subscription lapses (known backend gap) — check expiry here
              // too so the badge doesn't claim active PRO after it's expired.
              const isExpired = rawPlan === 'PRO' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) <= new Date();
              const plan = isExpired ? 'EXPIRED' : rawPlan;
              const isPro = rawPlan === 'PRO' && !isExpired;
              return (
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label={`${plan} plan – Profile menu`}
                  aria-expanded={showProfileMenu}
                  title={isExpired ? 'PRO plan expired' : `${plan} plan`}
                  className="p-0.5 rounded-full"
                >
                  <div className="relative w-8 h-8 lg:w-10 lg:h-10">

                    {/* Floating Badge */}
                    <span
                      className={`absolute -bottom-2 -left-3 -right-3 lg:-left-4 lg:-right-4 z-20 text-center whitespace-nowrap text-[10px] lg:text-[12px] font-black uppercase tracking-wide px-1 py-[2px] rounded-full shadow-sm border border-green-500/20 ${isExpired
                        ? 'bg-red-500 text-white'
                        : isPro
                          ? 'bg-primary-700 text-white'
                          : 'bg-primary-700 text-white'
                      }`}
                    >
                      {plan}
                    </span>
                    {/* Avatar ring and image/initial */}
                    <div className={`w-full h-full rounded-full overflow-hidden p-[2px]`}>
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
              );
            })()}
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

                <p className="text-[12px] text-slate-400 truncate">{user.email}</p>
              </div>

              {/* Wallet — mobile only (in dropdown) */}
              <div className="lg:hidden flex items-center gap-2.5 px-3 py-2.5 rounded-lg lg:rounded-xl bg-slate-100 dark:bg-slate-800 dark:bg-white/10 mb-1">
                <Wallet className="w-4 h-4 text-black dark:text-white" />
                <span className="text-sm font-bold text-black dark:text-white">Balance</span>
                <span className="ml-auto text-sm font-black text-black dark:text-white flex items-center gap-0.5">
                  <IndianRupee className="w-3 h-3" />{user.walletBalance || 0}
                </span>
              </div>

              {[
                { label: 'Profile', icon: User, path: '/profile' },
                { label: 'Settings', icon: Settings, path: '/settings' },
              ].map(item => (
                <Link key={item.path} href={item.path} onClick={() => setShowProfileMenu(false)}>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg lg:rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <item.icon className="w-4 h-4 text-slate-400" /> {item.label}
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
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg lg:rounded-xl text-sm font-semibold text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 transition-all"
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
