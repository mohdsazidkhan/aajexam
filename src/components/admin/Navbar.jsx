'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LogOut,
  Menu,
  X,
  Settings,
  LayoutDashboard,
  Filter,
  UserCircle,
  Bell,
  ChevronRight,
  Flame,
  Activity,
  Megaphone,
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/sidebarSlice';
import { initializeDarkMode } from '../../store/darkModeSlice';
import { secureLogout, getCurrentUser, getAuthToken } from '../../lib/utils/authUtils';
import { useSSR } from '../../hooks/useSSR';
import { useAdminMobileHeaderContext } from '../../contexts/AdminMobileHeaderContext';
import API from '../../lib/api';
import ThemeColorMenuButton from '../common/ThemeColorMenuButton';

const AdminNavbar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);
  const user = getCurrentUser();
  const { header, setDrawerOpen } = useAdminMobileHeaderContext();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [fetchedUsername, setFetchedUsername] = useState('');
  const username = user?.username || fetchedUsername;

  useEffect(() => {
    if (isMounted) {
      dispatch(initializeDarkMode());
    }
  }, [isMounted, dispatch]);

  // Sessions saved before login returned the username have none in localStorage: fetch it once for the menu header.
  useEffect(() => {
    if (!isMounted || !user || user.username) return;
    let cancelled = false;
    API.getProfile()
      .then((res) => {
        const u = res?.user || res?.data || res;
        if (!cancelled && u?.username) setFetchedUsername(u.username);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isMounted, user]);

  useEffect(() => {
    if (!isMounted) return;
    const fetchCount = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const res = await API.getAdminNotifications(1, 1, { unreadOnly: true });
        setNotifCount(res?.pagination?.total || (res?.data?.length || 0));
      } catch (err) {
        console.error('Error fetching notification count:', err);
      }
    };
    fetchCount();
  }, [isMounted]);

  if (!isMounted) return null;

  const handleLogout = () => secureLogout(router);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[150] h-12 xl:h-16 bg-white dark:bg-black border-b-2 border-slate-100 dark:border-slate-800 flex items-center">
        <div className="w-full mx-auto px-2 xl:px-4 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-2 xl:gap-4 min-w-0 flex-1">
            {/* Hamburger — desktop only (mobile version sits at the right end) */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isSidebarOpen}
              className={`hidden xl:flex w-8 h-8 rounded-lg items-center justify-center transition-all active:scale-95 shrink-0 ${
                isSidebarOpen
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-md hover:scale-105'
              }`}
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Logo — desktop */}
            <Link href="/admin/dashboard" className="hidden xl:flex items-center shrink-0">
              <span className="text-2xl xl:text-3xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white ">
                AAJ<span className="text-primary-600 dark:text-primary-300">EXAM</span>
              </span>
            </Link>

            {/* Logo — mobile, smaller, left-aligned */}
            <Link href="/admin/dashboard" className="xl:hidden flex items-center shrink-0">
              <span className="text-base font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                AAJ<span className="text-primary-600 dark:text-primary-300">EXAM</span>
              </span>
            </Link>

            {/* Page title + count — shown right after the logo (web + mobile) */}
            {header.title && (
              <div className="flex items-center gap-1 xl:gap-2 min-w-0 pl-2 xl:pl-4 ml-0 xl:ml-1 border-l border-slate-200 dark:border-slate-700">
                <span className="text-sm xl:text-lg font-black text-slate-900 dark:text-white truncate">{header.title}</span>
                {header.count !== null && header.count !== undefined && (
                  <span className="text-xs xl:text-sm font-bold text-slate-400 dark:text-slate-500 shrink-0">({header.count})</span>
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Filter — opens the drawer with this page's search/filters (web + mobile) */}
            {header.filters && (
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open filters"
                className="flex w-8 h-8 rounded-lg bg-primary-50 ring-1 ring-primary-200 dark:bg-slate-800 dark:ring-white/10 items-center justify-center text-primary-700 dark:text-primary-200 hover:text-primary-900 dark:hover:text-white hover:shadow-md transition-all flex-shrink-0"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Notifications — desktop only (mobile keeps it in the bottom nav) */}
            <Link
              href="/admin/notifications"
              aria-label="Notifications"
              className="hidden xl:flex relative w-8 h-8 rounded-lg bg-primary-50 ring-1 ring-primary-200 dark:bg-slate-800 dark:ring-white/10 items-center justify-center text-primary-700 dark:text-primary-200 hover:text-primary-900 dark:hover:text-white hover:shadow-md transition-all flex-shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </Link>

            {/* Theme colour + dark mode */}
            <ThemeColorMenuButton buttonClassName="flex w-8 h-8 rounded-lg bg-primary-50 ring-1 ring-primary-200 dark:bg-slate-800 dark:ring-white/10 items-center justify-center text-primary-700 dark:text-primary-200 hover:text-primary-900 dark:hover:text-white hover:shadow-md transition-all flex-shrink-0" />

            {/* Profile avatar */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="Profile menu"
              aria-expanded={showProfileMenu}
              className="p-0.5 rounded-full flex-shrink-0"
            >
              <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full overflow-hidden bg-primary-600 p-[2px]">
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
              className={`xl:hidden flex w-8 h-8 rounded-lg items-center justify-center transition-all active:scale-95 flex-shrink-0 ${
                isSidebarOpen
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
              {/* Identity header: avatar, name, email, role (same as the student menu) */}
              <div className="relative overflow-hidden px-4 pt-4 pb-3 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-white/10">
                <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '14px 14px' }} />
                <div className="pointer-events-none absolute -top-12 -right-10 w-36 h-36 bg-primary-300/25 dark:bg-primary-500/20 blur-2xl" style={{ borderRadius: '50%' }} />
                <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000]" style={{ borderRadius: 999 }}>
                  Admin
                </span>
                <div className="relative flex items-center gap-3">
                  <div className="shrink-0 p-[3px] bg-gradient-to-tr from-primary-300 via-primary-500 to-primary-700 shadow-md" style={{ borderRadius: 16 }}>
                    <div className="w-12 h-12 flex items-center justify-center bg-primary-600 text-white text-lg font-black uppercase border-2 border-white dark:border-slate-900" style={{ borderRadius: 13 }}>
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pr-12">
                    <p className="text-base font-black text-slate-900 dark:text-white leading-tight break-words">{user?.name || 'Admin'}</p>
                    {username && <p className="text-xs font-bold text-primary-700 dark:text-primary-300 break-all">@{username}</p>}
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-white/60 break-all">{user?.email || ''}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {[
                  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
                  { label: 'Profile', icon: UserCircle, path: '/admin/profile' },
                  { label: 'Most Active', icon: Flame, path: '/admin/most-active-users' },
                  { label: 'Traffic', icon: Activity, path: '/admin/traffic' },
                  { label: 'Announcements', icon: Megaphone, path: '/admin/announcements' },
                ].map(item => (
                  <Link key={item.path} href={item.path} onClick={() => setShowProfileMenu(false)}>
                    <button className="group w-full flex items-center gap-3 px-2 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-primary-500/10 transition-colors" style={{ borderRadius: 12 }}>
                      <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-primary-500/10 text-primary-700 dark:text-primary-300 group-hover:bg-primary-600 group-hover:text-white transition-colors" style={{ borderRadius: 10 }}>
                        <item.icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </Link>
                ))}

                <div className="my-2 border-t border-dashed border-slate-200 dark:border-slate-800 mx-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 text-sm font-black uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white transition-all"
                  style={{ borderRadius: 12 }}
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminNavbar;
