'use client';

import React from 'react';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
  Home,
  User,
  GraduationCap,
  Gamepad2,
  BookOpen
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import useTranslate from '../../hooks/useTranslate';

const PublicBottomNav = () => {
  const router = useRouter();
  const { translate } = useTranslate();
  const currentPath = router.pathname;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Exams', path: '/exams', icon: GraduationCap },
    { name: 'Quizzes', path: '/quizzes', icon: Gamepad2 },
    { name: 'Blog', path: '/blog', icon: BookOpen },
    { name: 'Login', path: '/login', icon: User },
  ];

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 h-16 bg-background-surface border-t border-border-primary flex items-center justify-around px-4 z-50">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <Link key={item.path} href={item.path} data-cta={item.path === '/login' ? 'bottom_nav_login' : undefined} className="flex-1">
            <div className={`
              flex flex-col items-center justify-center py-3 rounded-xl transition-colors relative
              ${isActive ? 'text-primary-600' : 'text-content-secondary'}
            `}>
              <item.icon className={`w-6 h-6 mb-1`} />
              <span className="text-[11px] font-bold">{translate(item.name)}</span>
              {isActive && (
                <motion.div
                  layoutId="public-bottom-nav-pill"
                  className="absolute inset-0 bg-background-surface-secondary rounded-xl -z-10"
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

