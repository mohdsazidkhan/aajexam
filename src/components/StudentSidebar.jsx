'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Home,
  Search,
  GraduationCap,
  Wallet,
  TrendingUp,
  User,
  LogOut,
  Globe,
  ShieldCheck,
  History,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toggleSidebar } from '../lib/store/sidebarSlice';
import { secureLogout, getCurrentUser, isAuthenticated } from '../lib/utils/authUtils';
import { useSSR } from '../hooks/useSSR';
import API from '../lib/api';

const StudentSidebar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const user = getCurrentUser();
  const authenticated = isAuthenticated();

  const [walletBalance, setWalletBalance] = useState(0);
  const fetchRef = useRef(false);

  useEffect(() => {
    const fetchWallet = async () => {
      if (authenticated && isMounted) {
        try {
          const res = await API.getWalletData();
          if (res?.success && res.data) {
            setWalletBalance(res.data.walletBalance || 0);
          }
        } catch (err) { console.error('Wallet Stats offline'); }
      }
    };
    if (authenticated && isMounted && !fetchRef.current) {
      fetchRef.current = true;
      fetchWallet();
    }
  }, [authenticated, isMounted]);

  const isActiveRoute = (path) => {
    if (!router?.pathname) return false;
    return path === '/home' ? router.pathname === '/home' || router.pathname === '/' : router.pathname.startsWith(path);
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) dispatch(toggleSidebar());
  };

  const sidebarSections = [
    {
      title: 'MAIN',
      items: [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/search', icon: Search, label: 'Search' },
        { path: '/govt-exams', icon: GraduationCap, label: 'Govt. Exams' },
      ]
    },
    {
      title: 'PROGRESS',
      items: [
        { path: '/my-analytics', icon: TrendingUp, label: 'Performance' },
        { path: '/exam-history', icon: History, label: 'Exam History' },
        { path: '/referral-history', icon: Globe, label: 'Referrals' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { path: '/profile', icon: User, label: 'Profile' },
        { path: '/subscription', icon: ShieldCheck, label: 'Subscription' },
        { path: '/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  if (!isMounted || !authenticated || !user) return null;

  const initials = (user.name || user.username || 'U').charAt(0).toUpperCase();

  return (
    <motion.div
      initial={false}
      animate={{
        x: isOpen ? 0 : -240,
        width: isOpen ? 240 : 0,
        opacity: isOpen ? 1 : 0
      }}
      className="fixed left-0 top-16 lg:top-20 bottom-0 z-[140] flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 shadow-[30px_0_60px_rgba(0,0,0,0.1)] dark:shadow-[30px_0_60px_rgba(0,0,0,0.3)] overflow-hidden"
    >
      {/* User greeting */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white text-sm font-black shadow-duo-primary flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-content-primary truncate uppercase">{user.name || user.username}</p>
            <p className="text-[10px] font-semibold text-content-muted truncate uppercase">
              {user.subscriptionStatus === 'pro' ? 'Pro Member' : 'Free Plan'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-premium">
        {sidebarSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] px-3 mb-2">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item, itemIdx) => {
                const active = isActiveRoute(item.path);
                return (
                  <Link key={itemIdx} href={item.path} onClick={handleNavClick}>
                    <button className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 relative group overflow-hidden ${active
                      ? 'text-white'
                      : darkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}>
                      {active && (
                        <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-primary-500 shadow-duo-primary rounded-xl" />
                      )}
                      <div className="flex items-center gap-3 relative z-10">
                        <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
                        <span className="text-[11px] font-bold tracking-wide uppercase">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold relative z-10 ${active ? 'bg-white/20 text-white' : 'bg-emerald-500 text-white'
                          }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5">
        <button
          onClick={() => secureLogout(router)}
          className="w-full py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold tracking-wide hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2 group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> LOG OUT
        </button>
      </div>
    </motion.div>
  );
};

export default StudentSidebar;
