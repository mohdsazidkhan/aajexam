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
        { path: '/pro/wallet', icon: Wallet, label: 'Wallet', badge: walletBalance > 0 ? `₹${walletBalance}` : null, badgeColor: 'emerald' },
        { path: '/subscription', icon: ShieldCheck, label: 'Subscription' },
        { path: '/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  if (!isMounted || !authenticated || !user) return null;

  return (
    <>
      {/* Main Sidebar Container Ã¢â‚¬â€ No internal overlay, handled by AppLayout */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          width: isOpen ? 320 : 0,
          opacity: isOpen ? 1 : 0
        }}
        className="fixed left-0 top-16 lg:top-20 bottom-0 z-[140] flex flex-col transition-all duration-700 ease-out border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 shadow-[30px_0_60px_rgba(0,0,0,0.1)] dark:shadow-[30px_0_60px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        <div className="absolute top-0 -left-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-2 scrollbar-premium relative z-10">
          {sidebarSections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-3 px-4">
                <h3 className="text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] whitespace-nowrap">
                  {section.title}
                </h3>
              </div>
              <div className="space-y-1 lg:space-y-1.5 px-1">
                {section.items.map((item, itemIdx) => {
                  const active = isActiveRoute(item.path);
                  return (
                    <Link key={itemIdx} href={item.path} onClick={handleNavClick}>
                      <button className={`w-full flex items-center justify-between px-2 lg:px-4 py-2 lg:py-4 rounded-2xl transition-all duration-300 relative group overflow-hidden ${active
                        ? 'text-white'
                        : darkMode ? 'text-slate-600 dark:text-slate-400 hover:text-white' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900'
                        }`}>
                        {active && (
                          <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-primary-500 shadow-duo-primary rounded-2xl border-t border-white/20" />
                        )}
                        {!active && <div className="absolute inset-0 bg-slate-500/0 group-hover:bg-slate-500/5 transition-colors" />}
                        <div className="flex items-center gap-4 relative z-10">
                          <item.icon className="w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110" />
                          <span className="text-[10px] font-black tracking-[0.15em] uppercase truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black relative z-10 shadow-sm border border-white/10 ${active ? 'bg-white/20 text-white' : item.badgeColor === 'emerald' ? 'bg-emerald-500 text-white' : 'bg-primary-500 text-white'
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

        <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 relative z-20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => secureLogout(router)}
            className="w-full py-5 rounded-[1.75rem] bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-duo-red hover:bg-rose-600 transition-all flex items-center justify-center gap-3 border-t border-white/20 group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> LOG OUT
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default StudentSidebar;


