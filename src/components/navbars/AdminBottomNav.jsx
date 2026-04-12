'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Bell,
  BarChart2,
  Users,
  Plus,
  X,
  HelpCircle,
  BookOpen,
  Zap,
  Newspaper,
  BarChart3,
  Flame,
  Wallet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REEL_TYPES = [
  { value: 'question', label: 'Question', icon: HelpCircle, gradient: 'from-blue-500 to-indigo-600', desc: 'MCQ with explanation' },
  { value: 'fact', label: 'Fact', icon: BookOpen, gradient: 'from-purple-500 to-pink-600', desc: 'Quick fact or one-liner' },
  { value: 'tip', label: 'Tip / Trick', icon: Zap, gradient: 'from-yellow-500 to-orange-600', desc: 'Shortcut or formula' },
  { value: 'current_affairs', label: 'Current Affairs', icon: Newspaper, gradient: 'from-red-500 to-rose-600', desc: 'Daily CA card' },
  { value: 'poll', label: 'Poll', icon: BarChart3, gradient: 'from-green-500 to-emerald-600', desc: 'Community poll' },
];

const AdminBottomNav = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  const [showCreate, setShowCreate] = useState(false);

  const navItems = [
    { name: 'Home', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Reels', path: '/admin/reels', icon: Flame },
    { name: 'Exams', path: '/admin/govt-exams', icon: BookOpen },
    { name: 'CREATE', path: null, icon: Plus },
    { name: 'Users', path: '/admin/students', icon: Users },
    { name: 'Payouts', path: '/admin/withdraw-requests', icon: Wallet },
    { name: 'Stats', path: '/admin/analytics/dashboard', icon: BarChart2 },
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[130] max-h-[85%] overflow-y-auto rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl"
              style={{ scrollbarWidth: 'none' }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              <div className="px-5 pb-24 pt-2">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Create Reel</h3>
                  <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {REEL_TYPES.map((type) => (
                    <motion.button
                      key={type.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setShowCreate(false);
                        router.push(`/admin/reels/create?type=${type.value}`);
                      }}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all active:bg-slate-50 dark:active:bg-slate-800"
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shrink-0`}>
                        <type.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{type.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{type.desc}</p>
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
      <nav aria-label="Admin navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 flex items-end justify-around px-1 pb-[env(safe-area-inset-bottom)] z-[135]">
        {navItems.map((item) => {
          // Center Plus button
          if (item.name === 'CREATE') {
            return (
              <button
                key="create"
                aria-label="Create new reel"
                onClick={() => setShowCreate(true)}
                className="flex items-center justify-center -mt-3 px-2"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </button>
            );
          }

          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          return (
            <Link key={item.path} href={item.path} className="flex-1 min-w-0" aria-current={isActive ? 'page' : undefined}>
              <div className={`flex flex-col items-center justify-center min-h-[44px] pt-2 pb-1.5 transition-all ${
                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
              }`}>
                <item.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[11px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default AdminBottomNav;
