'use client';

import React from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Bell,
  GraduationCap,
  Users,
  User,
  History,
  BarChart3,
  ShieldCheck,
  Banknote,
  Wallet,
  CreditCard,
  TrendingUp,
  LogOut,
  FileText,
  Globe,
  Contact2,
  Activity,
  PenSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useSSR } from '../hooks/useSSR';
import { isAdmin, hasAdminPrivileges, logAdminAction } from '../lib/utils/adminUtils';
import { secureLogout } from '../lib/utils/authUtils';
import { toggleSidebar } from '../lib/store/sidebarSlice';

const Sidebar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);

  const handleNavClick = (page) => {
    if (window.innerWidth < 1024) dispatch(toggleSidebar());
    logAdminAction('navigate', page, { timestamp: new Date().toISOString() });
  };

  const isActiveRoute = (path) => {
    if (router?.pathname === path) return true;
    if (path === '/admin/dashboard' || path === '/admin/govt-exams') return false;
    return router?.pathname?.startsWith(path + '/');
  };

  const sidebarSections = [
    {
      title: 'MAIN',
      items: [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
        { path: '/admin/notifications', icon: Bell, label: 'Notifications', key: 'notifications' },
      ]
    },
    {
      title: 'EXAMS',
      items: [
        { path: '/admin/govt-exams', icon: ShieldCheck, label: 'Categories', key: 'govt-exams-categories' },
        { path: '/admin/govt-exams/exams', icon: GraduationCap, label: 'Exams', key: 'govt-exams-exams' },
        { path: '/admin/govt-exams/patterns', icon: LayoutDashboard, label: 'Patterns', key: 'govt-exams-patterns' },
        { path: '/admin/govt-exams/tests', icon: FileText, label: 'Tests', key: 'govt-exams-tests' },
        { path: '/admin/govt-exams/results', icon: Activity, label: 'Results', key: 'govt-exams-results' },
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { path: '/admin/blogs', icon: PenSquare, label: 'Blog', key: 'blogs' },
      ]
    },
    {
      title: 'USERS',
      items: [
        { path: '/admin/students', icon: Users, label: 'Students', key: 'students' },
        { path: '/admin/user-details', icon: User, label: 'User Details', key: 'user-details' },
        { path: '/admin/contacts', icon: Contact2, label: 'Contact Requests', key: 'contacts' },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { path: '/admin/analytics/dashboard', icon: BarChart3, label: 'General', key: 'analytics-dashboard' },
        { path: '/admin/analytics/users', icon: Users, label: 'User Stats', key: 'analytics-users' },
        { path: '/admin/analytics/users-overview', icon: TrendingUp, label: 'Growth', key: 'analytics-users-overview' },
        { path: '/admin/analytics/financial', icon: Banknote, label: 'Financial', key: 'analytics-financial' },
        { path: '/admin/referral-analytics', icon: Globe, label: 'Referrals', key: 'referral-analytics' },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { path: '/admin/user-wallets', icon: Wallet, label: 'Wallets', key: 'user-wallets' },
        { path: '/admin/withdraw-requests', icon: Banknote, label: 'Payouts', key: 'withdraw-requests' },
        { path: '/admin/payment-transactions', icon: CreditCard, label: 'Transactions', key: 'transactions' },
        { path: '/admin/subscriptions', icon: ShieldCheck, label: 'Subscriptions', key: 'subscriptions' },
        { path: '/admin/bank-details', icon: FileText, label: 'Bank Details', key: 'bank-details' },
        { path: '/admin/referral-history', icon: Globe, label: 'Referral Payouts', key: 'referral-history' },
        { path: '/admin/expenses', icon: History, label: 'Expenses', key: 'platform-expenses' },
      ]
    },
  ];

  if (!isMounted || !isAdmin() || !hasAdminPrivileges()) return null;

  return (
    <div className={`fixed left-0 top-16 lg:top-20 bottom-0 z-[140] flex flex-col transition-all duration-700 ease-out bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 shadow-[30px_0_60px_rgba(0,0,0,0.1)] dark:shadow-[30px_0_60px_rgba(0,0,0,0.3)] overflow-hidden ${isOpen ? 'translate-x-0 w-60' : '-translate-x-full w-0 opacity-0'}`}>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-premium relative z-10">
        {sidebarSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] px-3 mb-2">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item, itemIdx) => {
                const active = isActiveRoute(item.path);
                return (
                  <Link key={itemIdx} href={item.path} onClick={() => handleNavClick(item.key)}>
                    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 relative group overflow-hidden ${active
                      ? 'text-white'
                      : darkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}>
                      {active && (
                        <motion.div layoutId="admin-nav-active" className="absolute inset-0 bg-primary-500 shadow-duo-primary rounded-xl" />
                      )}
                      <item.icon className="w-4 h-4 relative z-10 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
                      <span className="text-[11px] font-bold tracking-wide relative z-10 uppercase">{item.label}</span>
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
    </div>
  );
};

export default Sidebar;
