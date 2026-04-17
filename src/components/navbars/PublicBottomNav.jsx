'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  User,
  GraduationCap,
  Newspaper,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';

const PublicBottomNav = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Exams', path: '/exams', icon: GraduationCap },
    { name: 'Current Affairs', path: '/current-affairs', icon: Newspaper },
    { name: 'Notes', path: '/notes', icon: BookOpen },
    { name: 'Login', path: '/login', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-around px-4 z-50 shadow-2xl">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <Link key={item.path} href={item.path} className="flex-1">
            <div className={`
              flex flex-col items-center justify-center py-3 rounded-2xl transition-all relative
              ${isActive ? 'text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400'}
            `}>
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[11px] font-black uppercase tracking-[0.1em]">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="public-bottom-nav-pill"
                  className="absolute inset-0 bg-primary-500/5 dark:bg-primary-500/10 rounded-2xl -z-10"
                />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default PublicBottomNav;

