'use client';

import React from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Bell,
  Layers,
  Puzzle,
  BookOpen,
  HelpCircle,
  GraduationCap,
  Trophy,
  Users,
  User,
  History,
  BarChart3,
  ShieldCheck,
  Banknote,
  Wallet,
  CreditCard,
  TrendingUp,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  FileText,
  Zap,
  RotateCcw,
  Globe,
  Contact2,
  Flame,
  Activity,
  Crown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSSR } from '../hooks/useSSR';
import { isAdmin, hasAdminPrivileges, logAdminAction } from '../lib/utils/adminUtils';
import { secureLogout } from '../lib/utils/authUtils';
import { toggleSidebar } from '../lib/store/sidebarSlice';

const Sidebar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

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
      title: 'OVERVIEW',
      items: [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' }
      ]
    },
    {
      title: 'NOTIFICATIONS',
      items: [
        { path: '/admin/notifications', icon: Bell, label: 'Alerts', key: 'notifications' },
      ]
    },
    {
      title: 'ORGANIZATION',
      items: [
        { path: '/admin/categories', icon: Layers, label: 'Categories', key: 'categories' },
        { path: '/admin/subcategories', icon: Puzzle, label: 'Subcategories', key: 'subcategories' },
        { path: '/admin/levels', icon: Trophy, label: 'Levels', key: 'levels' },
      ]
    },
    {
      title: 'MANAGE CONTENT',
      items: [
        { path: '/admin/quizzes', icon: BookOpen, label: 'Quizzes', key: 'quizzes' },
        { path: '/admin/questions', icon: HelpCircle, label: 'Questions', key: 'questions' },
        { path: '/admin/articles', icon: Zap, label: 'Articles', key: 'articles' },
      ]
    },
    {
      title: 'GOVT EXAMS',
      items: [
        { path: '/admin/govt-exams', icon: ShieldCheck, label: 'Exam Categories', key: 'govt-exams-categories' },
        { path: '/admin/govt-exams/exams', icon: GraduationCap, label: 'Practice Exams', key: 'govt-exams-exams' },
        { path: '/admin/govt-exams/patterns', icon: LayoutDashboard, label: 'Exam Patterns', key: 'govt-exams-patterns' },
        { path: '/admin/govt-exams/tests', icon: FileText, label: 'Practice Tests', key: 'govt-exams-tests' },
        { path: '/admin/govt-exams/results', icon: Activity, label: 'Results & Stats', key: 'govt-exams-results' },
      ]
    },
    {
      title: 'USER SUBMISSIONS',
      items: [
        { path: '/admin/user-questions', icon: HelpCircle, label: 'User Questions', key: 'user-questions' },
        { path: '/admin/user-quizzes', icon: BookOpen, label: 'User Quizzes', key: 'user-quizzes' },
        { path: '/admin/user-blogs', icon: Zap, label: 'User Articles', key: 'user-blogs' },
      ]
    },
    {
      title: 'USER MANAGEMENT',
      items: [
        { path: '/admin/students', icon: Users, label: 'Students', key: 'students' },
        { path: '/admin/user-details', icon: User, label: 'User Details', key: 'user-details' },
        { path: '/admin/prev-month-played-users', icon: History, label: 'Activity Logs', key: 'prev-month-users' },
        { path: '/admin/contacts', icon: Contact2, label: 'Contact Requests', key: 'contacts' },
      ]
    },
    {
      title: 'STATS & REWARDS',
      items: [
        { path: '/admin/referral-history', icon: Globe, label: 'Referral History', key: 'referral-history' },
        { path: '/admin/referral-analytics', icon: BarChart3, label: 'Referral Stats', key: 'referral-analytics' },
        { path: '/admin/blog-rewards-history', icon: Flame, label: 'Article Rewards', key: 'blog-rewards' },
        { path: '/admin/quiz-rewards-history', icon: Trophy, label: 'Quiz Rewards', key: 'quiz-rewards' },
        { path: '/admin/monthly-winners', icon: Crown, label: 'Monthly Winners', key: 'monthly-winners' },
        { path: '/admin/competition-resets', icon: RotateCcw, label: 'Reset History', key: 'competition-resets' },
      ]
    },
    {
      title: 'REPORTS & ANALYTICS',
      items: [
        { path: '/admin/analytics/dashboard', icon: BarChart3, label: 'General Stats', key: 'analytics-dashboard' },
        { path: '/admin/analytics/users', icon: Users, label: 'User Stats', key: 'analytics-users' },
        { path: '/admin/analytics/users-overview', icon: TrendingUp, label: 'Growth Stats', key: 'analytics-users-overview' },
        { path: '/admin/analytics/quizzes', icon: BookOpen, label: 'Quiz Stats', key: 'analytics-quizzes' },
        { path: '/admin/analytics/financial', icon: Banknote, label: 'Payment Stats', key: 'analytics-financial' },
        { path: '/admin/analytics/performance', icon: Activity, label: 'Performance', key: 'analytics-performance' },
      ]
    },
    {
      title: 'PAYMENTS & WALLETS',
      items: [
        { path: '/admin/user-wallets', icon: Wallet, label: 'Student Wallets', key: 'user-wallets' },
        { path: '/admin/withdraw-requests', icon: Banknote, label: 'Payout Requests', key: 'withdraw-requests' },
        { path: '/admin/bank-details', icon: FileText, label: 'Bank Information', key: 'bank-details' },
        { path: '/admin/payment-transactions', icon: Activity, label: 'Transactions', key: 'transactions' },
        { path: '/admin/subscriptions', icon: CreditCard, label: 'Subscribers', key: 'subscriptions' },
        { path: '/admin/expenses', icon: History, label: 'Platform Costs', key: 'platform-expenses' },
      ]
    },
  ];

  if (!isMounted || !isAdmin() || !hasAdminPrivileges()) return null;

  return (
    <div className={`fixed left-0 top-16 lg:top-20 bottom-0 z-[140] flex flex-col transition-all duration-700 ease-out border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 shadow-[30px_0_60px_rgba(0,0,0,0.1)] dark:shadow-[30px_0_60px_rgba(0,0,0,0.3)] overflow-hidden ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full w-0 opacity-0'}`}>

      {/* Decorative Background Glows */}
      <div className="absolute top-0 -left-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />


      {/* --- Main Navigation Area --- */}
      <nav className="flex-1 overflow-y-auto py-8 px-6 space-y-12 scrollbar-premium relative z-10">
        {sidebarSections.map((section, idx) => (
          <div key={idx} className="space-y-5">
            <div className="flex items-center gap-3 px-4">
              <h3 className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap">{section.title}</h3>
            </div>
            <div className="space-y-1.5 px-1">
              {section.items.map((item, itemIdx) => {
                const active = isActiveRoute(item.path);
                return (
                  <div key={itemIdx} className="relative group">
                    <Link href={item.path} onClick={() => handleNavClick(item.key)}>
                      <button className={`w-full flex items-center gap-5 px-5 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${active ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        {active && (
                          <motion.div layoutId="admin-nav-active" className="absolute inset-0 bg-primary-500 shadow-duo-primary rounded-2xl" />
                        )}
                        {!active && <div className="absolute inset-0 bg-white/0 group-hover:bg-slate-500/5 dark:group-hover:bg-white/5 transition-colors" />}

                        <item.icon className={`w-4.5 h-4.5 relative z-10 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary-500'}`} />
                        <span className="text-[10px] font-black tracking-[0.15em] uppercase relative z-10 transition-all group-hover:translate-x-1">{item.label}</span>
                        {active && <ChevronRight className="w-3 h-3 ml-auto text-white/50 relative z-10" />}
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* --- Logout Area --- */}
      <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 relative z-20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => secureLogout(router)}
          className="w-full py-5 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-duo-rose hover:bg-rose-600 transition-all flex items-center justify-center gap-3 border-none group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> LOG OUT
        </motion.button>
        <div className="pt-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 group">
            <span className="w-1 h-1 rounded-full bg-primary-500 animate-pulse group-hover:scale-150 transition-transform" />
            <p className="text-[8px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest leading-none">SECURE ACCESS ACTIVE</p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Sidebar;


