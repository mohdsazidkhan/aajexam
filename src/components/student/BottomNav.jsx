'use client';

import { stripStudent } from '../../lib/utils/appRoutes';
import React, { useState } from 'react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
  Home,
  BookOpen,
  Search,
  User,
  Plus,
  X,
  HelpCircle,
  Zap,
  Newspaper,
  BarChart3,
  MessageCircle,
  BrainCircuit
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import useTranslate from '../../hooks/useTranslate';

const REEL_TYPES = [
  { value: 'question', label: 'Question', icon: HelpCircle, gradient: 'bg-gradient-to-br from-primary-300 to-primary-400 shadow rotate-[-4deg]', iconColor: 'text-primary-950', desc: 'MCQ with explanation' },
  { value: 'fact', label: 'Fact', icon: BookOpen, gradient: 'bg-gradient-to-br from-primary-300 to-primary-400 shadow rotate-[-4deg]', iconColor: 'text-primary-950', desc: 'Quick fact or one-liner' },
  { value: 'tip', label: 'Tip / Trick', icon: Zap, gradient: 'bg-gradient-to-br from-primary-300 to-primary-400 shadow rotate-[-4deg]', iconColor: 'text-primary-950', desc: 'Shortcut or formula' },
  { value: 'current_affairs', label: 'Current Affairs', icon: Newspaper, gradient: 'bg-gradient-to-br from-primary-300 to-primary-400 shadow rotate-[-4deg]', iconColor: 'text-primary-950', desc: 'Daily CA card' },
  { value: 'poll', label: 'Poll', icon: BarChart3, gradient: 'bg-gradient-to-br from-primary-300 to-primary-400 shadow rotate-[-4deg]', iconColor: 'text-primary-950', desc: 'Community poll' },
];

const StudentBottomNav = () => {
  const router = useRouter();
  const { translate } = useTranslate();
  const currentPath = stripStudent(router.pathname);
  const [showCreate, setShowCreate] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: Home },
    { name: 'Blogs', path: '/blog', icon: Newspaper },
    { name: 'Exams', path: '/govt-exams', icon: BookOpen },
    { name: 'CREATE', path: null, icon: Plus },
    { name: 'Quizzes', path: '/quizzes', icon: BrainCircuit },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Profile', path: '/student/profile', icon: User },
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] max-h-[85%] flex flex-col rounded-t-3xl bg-white dark:bg-slate-900 border-t-4 border-primary-300 shadow-2xl"
            >
              <div className="shrink-0">
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>
                <div className="flex items-center justify-between px-5 pb-3">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{translate('Create Reel')}</h3>
                  <button aria-label={translate('Close')} onClick={() => setShowCreate(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-24 pt-2" style={{ scrollbarWidth: 'none' }}>
                <div className="space-y-2.5">
                  {REEL_TYPES.map((type) => (
                    <motion.button
                      key={type.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setShowCreate(false);
                        router.push(`/reels/create?type=${type.value}`);
                      }}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg hover:border-primary-500 transition-all active:bg-slate-50 dark:active:bg-slate-800"
                    >
                      <div className={`w-11 h-11 rounded-lg xl:rounded-xl ${type.gradient} flex items-center justify-center shrink-0`}>
                        <type.icon className={`w-5 h-5 ${type.iconColor}`} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{translate(type.label)}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{translate(type.desc)}</p>
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
      <nav aria-label={translate('Main navigation')} className="xl:hidden fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-black border-t-2 border-slate-200 dark:border-slate-800 flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)] z-[135]">
        {navItems.map((item) => {
          // Create — its own flex slot like every other item, just lifted up
          // by translate so it floats half above / half inside the bar.
          if (item.name === 'CREATE') {
            return (
              <button
                key="create"
                aria-label={showCreate ? translate('Close create menu') : translate('Create new reel')}
                onClick={() => setShowCreate((prev) => !prev)}
                className="flex-1 min-w-0 flex items-center justify-center -translate-y-5"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-300 to-primary-400 ring-4 ring-white dark:ring-black flex items-center justify-center shadow-lg">
                  {showCreate ? <X className="w-6 h-6 text-primary-950" /> : <Plus className="w-7 h-7 text-primary-950" />}
                </div>
              </button>
            );
          }

          const itemPath = stripStudent(item.path);
          const isActive = currentPath === itemPath || currentPath.startsWith(itemPath + '/');
          return (
            <Link key={item.path} href={item.path} className="flex-1 min-w-0 flex justify-center" aria-current={isActive ? 'page' : undefined}>
              <div className={`w-full flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive ? 'bg-gradient-to-t from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000]' : 'text-slate-400 dark:text-slate-500'
              }`}>
                <item.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>{translate(item.name)}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default StudentBottomNav;
