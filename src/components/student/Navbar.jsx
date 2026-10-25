'use client';

import React, { useState, useEffect } from 'react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { useSelector, useDispatch } from 'react-redux';
import {
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
  Gift,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

import { useClientSide, useAuthStatus } from '../../hooks/useClientSide';
import { secureLogout } from '../../lib/utils/authUtils';
import { initializeDarkMode } from '../../store/darkModeSlice';
import { toggleSidebar } from '../../lib/store/sidebarSlice';
import API from '../../lib/api';
import Image from "next/image";
import ThemeColorMenuButton from '../common/ThemeColorMenuButton';
import useTranslate from '../../hooks/useTranslate';

// Desktop navbar title: label of the active page (same wording as the sidebar entries).
const PAGE_TITLES = [
  ['/student/dashboard', 'Dashboard'], ['/student/notifications', 'Notifications'], ['/features', 'Features'],
  ['/search', 'Search'], ['/reels/create', 'Create Reel'], ['/reels', 'Reels'], ['/student/my-reels', 'My Reels'],
  ['/student/bookmarks', 'Bookmarks'], ['/govt-exams', 'Govt. Exams'], ['/quizzes', 'Quizzes'], ['/quiz', 'Quizzes'],
  ['/subjects', 'Subjects'], ['/topics', 'Topics'], ['/blog', 'Blog'],
  ['/community-questions/ask', 'Create Q&A'], ['/community-questions', 'Community Q&A'],
  ['/student/my-questions', 'My Q&A'], ['/daily-challenge', 'Daily Challenge'], ['/student/streak', 'Streak'],
  ['/current-affairs', 'Current Affairs'], ['/exam-news', 'Exam News'], ['/student/exam-calendar', 'Exam Calendar'],
  ['/pyq', "PYQ's"], ['/student/syllabus-tracker', 'Syllabus Tracker'], ['/student/revision', 'Revision Queue'],
  ['/student/study-plan', 'Study Planner'], ['/notes', 'Notes & Formulas'], ['/interview-questions', 'Interview Questions'],
  ['/mentors', 'Mentors'], ['/student/leaderboard', 'Leaderboard'], ['/student/all-india-rank', 'All India Rank'],
  ['/student/state-rank', 'State Rank'], ['/student/city-rank', 'City Rank'], ['/student/my-analytics', 'Performance'],
  ['/student/readiness', 'Exam Readiness'], ['/student/exam-history', 'Exam History'],
  ['/student/payment-history', 'Payment History'], ['/student/quiz-history', 'Quiz History'],
  ['/student/my-challenges', 'My Challenges'], ['/student/referral-history', 'Referrals'],
  ['/student/profile', 'Profile'], ['/student/subscription', 'Subscription'], ['/student/settings', 'Settings'],
];

const pageTitleFor = (pathname) => {
  const path = pathname || '';
  const hit = PAGE_TITLES.filter(([p]) => path === p || path.startsWith(p + '/')).sort((a, b) => b[0].length - a[0].length)[0];
  if (hit) return hit[1];
  const seg = path.split('/').filter((x) => x && x !== 'student' && !x.startsWith('['))[0];
  return seg ? seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
};

const StudentNavbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { translate } = useTranslate();
  const isClient = useClientSide();
  const { user } = useAuthStatus();
  const isSidebarOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [extra, setExtra] = useState(null);

  useEffect(() => {
    if (isClient) dispatch(initializeDarkMode());
  }, [isClient, dispatch]);

  // Sessions saved before login returned the photo have no profilePicture in localStorage:
  // fetch it once and merge it in so the avatar and the menu header show the photo.
  useEffect(() => {
    if (!isClient || !user || user.profilePicture) return;
    let cancelled = false;
    API.getProfile()
      .then((res) => {
        const u = res?.user || res?.data || res;
        if (cancelled || !u?.profilePicture) return;
        try {
          const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
          localStorage.setItem('userInfo', JSON.stringify({ ...stored, profilePicture: u.profilePicture, username: stored.username || u.username }));
          window.dispatchEvent(new Event('authStateChanged'));
        } catch { /* storage unavailable */ }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isClient, user]);

  useEffect(() => {
    if (!isClient || !user) return;
    let cancelled = false;
    API.getUnreadNotificationCount()
      .then(res => { if (!cancelled) setUnreadCount(res?.pagination?.total || 0); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isClient, user, router.pathname]);

  // Login does not return the profile picture; fetch it (and the username) once and remember it.
  const needsIdentity = !!user && (!user.profilePicture || !user.username);
  useEffect(() => {
    if (!isClient || !needsIdentity) return;
    let cancelled = false;
    API.request('/api/auth/me')
      .then((res) => {
        if (cancelled || !res?.success) return;
        setExtra({ profilePicture: res.user.profilePicture, username: res.user.username });
        try {
          const stored = JSON.parse(localStorage.getItem('userInfo') || 'null');
          if (stored) localStorage.setItem('userInfo', JSON.stringify({ ...stored, profilePicture: res.user.profilePicture, username: res.user.username }));
        } catch { /* storage unavailable */ }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isClient, needsIdentity]);

  const handleLogout = () => secureLogout(router);

  if (!isClient || !user) return null;

  const profilePicture = user.profilePicture || extra?.profilePicture || null;
  const username = user.username || extra?.username || null;

  // subscriptionStatus isn't downgraded server-side when the subscription
  // lapses (known backend gap) — check expiry here too so the badge doesn't
  // claim active PRO after it's expired.
  const rawPlan = (user.subscriptionStatus || 'FREE').toUpperCase();
  const isExpired = rawPlan === 'PRO' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) <= new Date();
  const plan = isExpired ? 'EXPIRED' : rawPlan;
  const pageTitle = pageTitleFor(router.pathname);
  const planBadgeClassWeb = `absolute top-2 right-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${isExpired ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow'}`;
  const planBadgeClassMobile = `absolute top-1 -right-[45px] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${isExpired ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow'}`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[150] h-12 xl:h-16 bg-white dark:bg-black border-b-2 border-slate-100 dark:border-slate-800 flex items-center">
        <div className="relative w-full mx-auto px-2 xl:px-4 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger — desktop only (mobile version sits at the right end) */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              aria-label={isSidebarOpen ? translate('Close menu') : translate('Open menu')}
              aria-expanded={isSidebarOpen}
              className={`hidden xl:flex w-10 h-10 rounded-2xl items-center justify-center transition-all active:scale-95 ${isSidebarOpen
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-md hover:scale-105'
                }`}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo — desktop */}
            <Link href="/student/dashboard" className="relative hidden xl:flex items-start gap-1">
              <span className="flex flex-col leading-none">
                <span className="text-2xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                  AAJ<span className="text-primary-600 dark:text-primary-300">{translate('EXAM')}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.1em] uppercase mt-0.5">
                  {translate('Prepare Your Exam Today')}
                </span>
              </span>
              <span className={planBadgeClassWeb}>{plan}</span>
            </Link>

            {/* Logo — mobile, smaller, left-aligned */}
            <Link href="/student/dashboard" className="relative xl:hidden flex items-center gap-1.5 shrink-0">
              <span className="text-xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                AAJ<span className="text-primary-600 dark:text-primary-300">{translate('EXAM')}</span>
              </span>
              <span className={planBadgeClassMobile}>{plan}</span>
            </Link>
          </div>

          {/* Active page title — desktop: starts where the sidebar ends (240px) so it lines up with the page content */}
          {pageTitle && (
            <p className="hidden xl:block absolute left-[256px] top-1/2 -translate-y-1/2 max-w-[13rem] 2xl:max-w-[22rem] truncate pl-3 border-l-4 border-primary-600 dark:border-primary-300 leading-tight text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {translate(pageTitle)}
            </p>
          )}

          {/* Center — logged-in user's name on desktop */}
          <div className="hidden xl:block absolute left-1/2 -translate-x-1/2">
            <span className="uppercase text-lg font-black text-slate-700 dark:text-slate-300 truncate max-w-xs">
              {translate('Welcome back,')} <span className="text-primary-600 dark:text-primary-300">{user.name}</span>
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 xl:gap-4">
            {/* Notifications */}
            <Link
              href="/student/notifications"
              aria-label={unreadCount > 0 ? translate('Notifications, {count} unread', { count: unreadCount }) : translate('Notifications')}
              className="relative flex w-9 h-9 xl:w-10 xl:h-10 rounded-lg xl:rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center text-primary-700 dark:text-slate-300 hover:text-primary-900 hover:shadow-md transition-all flex-shrink-0"
            >
              <Bell className="w-4 h-4 xl:w-5 xl:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] text-[9px] font-black flex items-center justify-center shadow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Theme colour + dark mode */}
            <ThemeColorMenuButton buttonClassName="flex w-9 h-9 xl:w-10 xl:h-10 rounded-lg xl:rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center text-primary-700 dark:text-slate-300 hover:text-primary-900 hover:shadow-md transition-all flex-shrink-0" />

            {/* Profile avatar — plan (PRO/FREE/EXPIRED) now shown as a
                badge next to the logo instead of floating on the avatar. */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label={translate('{plan} plan – Profile menu', { plan })}
              aria-expanded={showProfileMenu}
              title={isExpired ? translate('PRO plan expired') : translate('{plan} plan', { plan })}
              className="p-0.5 rounded-full"
            >
              <div className="relative w-8 h-8 xl:w-10 xl:h-10">
                <div className="w-full h-full rounded-full overflow-hidden p-[2px]">
                  {profilePicture ? (
                    <Image
                      src={profilePicture}
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
              aria-label={isSidebarOpen ? translate('Close menu') : translate('Open menu')}
              aria-expanded={isSidebarOpen}
              className={`xl:hidden flex w-9 h-9 rounded-lg items-center justify-center transition-all active:scale-95 flex-shrink-0 ${isSidebarOpen
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-md'
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
              className="fixed top-12 xl:top-16 right-3 xl:right-8 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[170] overflow-hidden"
              style={{ borderRadius: 20 }}
            >
              {/* Identity header: photo, name, username, email, plan */}
              <div className="relative overflow-hidden px-4 pt-4 pb-3 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-white/10">
                <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '14px 14px' }} />
                <div className="pointer-events-none absolute -top-12 -right-10 w-36 h-36 bg-primary-300/25 dark:bg-primary-500/20 blur-2xl" style={{ borderRadius: '50%' }} />
                <span className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${isExpired ? 'bg-red-500 text-white' : rawPlan === 'PRO' ? 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-black shadow' : 'bg-slate-200 text-slate-700 ring-1 ring-slate-300 dark:bg-white/15 dark:text-white dark:ring-white/30'}`} style={{ borderRadius: 999 }}>
                  {isExpired ? 'EXPIRED' : rawPlan === 'PRO' ? 'PRO' : translate('FREE')}
                </span>
                <div className="relative flex items-center gap-3">
                  <div className="shrink-0 p-[3px] bg-gradient-to-tr from-primary-300 via-primary-500 to-primary-700 shadow-md" style={{ borderRadius: 16 }}>
                    {profilePicture ? (
                      <Image
                        src={profilePicture}
                        alt={user.name || 'Profile'}
                        width={56}
                        height={56}
                        className="w-14 h-14 object-cover border-2 border-white dark:border-slate-900"
                        style={{ borderRadius: 13 }}
                      />
                    ) : (
                      <div className="w-14 h-14 flex items-center justify-center bg-primary-600 text-white text-xl font-black uppercase border-2 border-white dark:border-slate-900" style={{ borderRadius: 13 }}>
                        {user.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pr-10">
                    <p className="text-base font-black text-slate-900 dark:text-white leading-tight truncate">{user.name}</p>
                    {username && <p className="text-xs font-bold text-primary-700 dark:text-primary-300 truncate">@{username}</p>}
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-white/60 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {[
                  { label: translate('Profile'), icon: User, path: '/student/profile' },
                  { label: translate('Subscription'), icon: ShieldCheck, path: '/student/subscription' },
                  { label: translate('Referral Rewards'), icon: Gift, path: '/student/referral-history', showBalance: true },
                  { label: translate('Settings'), icon: Settings, path: '/student/settings' },
                ].map(item => (
                  <Link key={item.path} href={item.path} onClick={() => setShowProfileMenu(false)}>
                    <button className="group w-full flex items-center gap-3 px-2 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-primary-500/10 transition-colors" style={{ borderRadius: 12 }}>
                      <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-primary-500/10 text-primary-700 dark:text-primary-300 group-hover:bg-primary-600 group-hover:text-white transition-colors" style={{ borderRadius: 10 }}>
                        <item.icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.showBalance ? (
                        <span className="px-2 py-0.5 bg-primary-500/10 text-sm font-black text-primary-700 dark:text-primary-300 flex items-center gap-0.5" style={{ borderRadius: 999 }}>
                          <IndianRupee className="w-3 h-3" />{user.walletBalance || 0}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </button>
                  </Link>
                ))}

                <div className="my-2 border-t border-dashed border-slate-200 dark:border-slate-800 mx-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 text-sm font-black uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white transition-all"
                  style={{ borderRadius: 12 }}
                >
                  <LogOut className="w-4 h-4" /> {translate('Log out')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentNavbar;
