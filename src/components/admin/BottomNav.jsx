'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import API from '../../lib/api';
import { getAuthToken } from '../../lib/utils/authUtils';
import {
  Home,
  Users,
  Plus,
  X,
  HelpCircle,
  BookOpen,
  Zap,
  Newspaper,
  BarChart3,
  BrainCircuit,
  PenSquare,
  FileText,
  Bell,
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

const REEL_TYPES = [
  { value: 'question', label: 'Question', icon: HelpCircle, gradient: 'bg-primary-600', iconColor: 'text-on-primary', desc: 'MCQ with explanation' },
  { value: 'fact', label: 'Fact', icon: BookOpen, gradient: 'bg-primary-600', iconColor: 'text-on-primary', desc: 'Quick fact or one-liner' },
  { value: 'tip', label: 'Tip / Trick', icon: Zap, gradient: 'bg-primary-600', iconColor: 'text-on-primary', desc: 'Shortcut or formula' },
  { value: 'current_affairs', label: 'Current Affairs', icon: Newspaper, gradient: 'bg-primary-600', iconColor: 'text-on-primary', desc: 'Daily CA card' },
  { value: 'poll', label: 'Poll', icon: BarChart3, gradient: 'bg-primary-600', iconColor: 'text-on-primary', desc: 'Community poll' },
];

const CONTENT_TYPES = [
  { path: '/admin/quiz/questions', label: 'Quiz Question', icon: BrainCircuit, gradient: 'bg-primary-600', iconColor: 'text-on-primary', desc: 'Add a question to a quiz' },
  { path: '/admin/blogs/create', label: 'Blog', icon: PenSquare, gradient: 'bg-primary-600', iconColor: 'text-on-primary', desc: 'Write a new blog post' },
  { path: '/admin/current-affairs', label: 'Current Affairs', icon: Newspaper, gradient: 'bg-primary-600', iconColor: 'text-on-primary', desc: 'Add a current affairs entry' },
  { path: '/admin/pyq/create', label: 'PYQ Paper', icon: FileText, gradient: 'bg-primary-600', iconColor: 'text-on-primary', desc: 'Add a previous year paper' },
];

const AdminBottomNav = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  const [showCreate, setShowCreate] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
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
  }, []);

  const navItems = [
    { name: 'Home', path: '/admin/dashboard', icon: Home },
    { name: 'Exams', path: '/admin/govt-exams/exams', icon: BookOpen },
    { name: 'Quizzes', path: '/admin/quiz/quizzes', icon: BrainCircuit },
    { name: 'CREATE', path: null, icon: Plus },
    { name: 'Users', path: '/admin/students', icon: Users },
    { name: 'Notify', path: '/admin/notifications', icon: Bell },
    { name: 'Overview', path: '/admin/analytics/dashboard', icon: BarChart3 },
  ];

  return (
    <>
      {/* Create Reel Bottom Drawer */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="fixed inset-0 bg-black/50 z-[120]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[130] max-h-[85%] flex flex-col rounded-t-3xl bg-background-surface border-t border-border-primary"
            >
              <div className="shrink-0">
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full bg-border-primary dark:bg-slate-700" />
                </div>
                <div className="flex items-center justify-between px-5 pb-3">
                  <h3 className="text-sm font-bold text-content-primary uppercase tracking-[0.08em]">Create</h3>
                  <button aria-label="Close" onClick={() => setShowCreate(false)} className="p-1.5 rounded-full bg-background-surface-secondary">
                    <X className="w-4 h-4 text-content-muted" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-24 pt-2" style={{ scrollbarWidth: 'none' }}>
                <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-2.5">Reel</p>
                <div className="space-y-2.5 mb-6">
                  {REEL_TYPES.map((type) => (
                    <motion.button
                      key={type.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setShowCreate(false);
                        router.push(`/admin/reels/create?type=${type.value}`);
                      }}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-border-primary hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all active:bg-slate-50 dark:active:bg-slate-800"
                    >
                      <div className={`w-11 h-11 rounded-lg xl:rounded-xl ${type.gradient} flex items-center justify-center shrink-0`}>
                        <type.icon className={`w-5 h-5 ${type.iconColor}`} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-content-primary">{type.label}</p>
                        <p className="text-[11px] text-content-muted font-medium">{type.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-2.5">Content</p>
                <div className="space-y-2.5">
                  {CONTENT_TYPES.map((type) => (
                    <motion.button
                      key={type.path}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setShowCreate(false);
                        router.push(type.path);
                      }}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-border-primary hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all active:bg-slate-50 dark:active:bg-slate-800"
                    >
                      <div className={`w-11 h-11 rounded-lg xl:rounded-xl ${type.gradient} flex items-center justify-center shrink-0`}>
                        <type.icon className={`w-5 h-5 ${type.iconColor}`} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-content-primary">{type.label}</p>
                        <p className="text-[11px] text-content-muted font-medium">{type.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav aria-label="Admin navigation" className="xl:hidden fixed bottom-0 left-0 right-0 h-14 bg-background-surface border-t border-border-primary flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)] z-[135]">
        {navItems.map((item) => {
          // Create — its own flex slot like every other item, just lifted up
          // by translate so it floats half above / half inside the bar.
          if (item.name === 'CREATE') {
            return (
              <button
                key="create"
                aria-label={showCreate ? 'Close create menu' : 'Create new reel'}
                title={showCreate ? 'Close create menu' : 'Create new reel'}
                onClick={() => setShowCreate((prev) => !prev)}
                className="flex-1 min-w-0 flex items-center justify-center -translate-y-5"
              >
                <div className="w-11 h-11 rounded-full ring-4 ring-white dark:ring-black flex items-center justify-center bg-primary-600">
                  {showCreate ? <X className="w-6 h-6 text-on-primary" /> : <Plus className="w-7 h-7 text-on-primary" />}
                </div>
              </button>
            );
          }

          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          return (
            <Link key={item.path} href={item.path} className="flex-1 min-w-0 flex justify-center" aria-label={item.name} title={item.name} aria-current={isActive ? 'page' : undefined}>
              <div className={`w-full flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive ? 'text-on-primary bg-primary-600' : 'text-content-muted'
              }`}>
                <span className="relative inline-flex">
                  <item.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 1.8} />
                  {item.name === 'Notify' && notifCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[1.1rem] h-[1.1rem] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  )}
                </span>
                <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default AdminBottomNav;
