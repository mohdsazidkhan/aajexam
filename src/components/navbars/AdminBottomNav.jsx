'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Bell,
  BarChart2,
  Users,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminBottomNav = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  const leftItems = [
    { name: 'DASHBOARD', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'NOTIFS', path: '/admin/notifications', icon: Bell },
  ];

  const rightItems = [
    { name: 'USERS', path: '/admin/users', icon: Users },
    { name: 'ANALYTICS', path: '/admin/analytics/dashboard', icon: BarChart2 },
  ];

  const NavItem = ({ item }) => {
    const isActive = currentPath === item.path;
    return (
      <Link href={item.path} className="flex-1">
        <div className={`
          flex flex-col items-center justify-center py-3 rounded-2xl transition-all relative
          ${isActive ? 'text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400'}
        `}>
          <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
          <span className="text-[8px] font-black uppercase tracking-[0.15em]">{item.name}</span>
          {isActive && (
            <motion.div
              layoutId="admin-bottom-nav-pill"
              className="absolute inset-0 bg-primary-500/5 dark:bg-primary-500/10 rounded-2xl -z-10"
            />
          )}
        </div>
      </Link>
    );
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-around px-4 z-[110]"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', height: '64px' }}
    >
      {leftItems.map((item) => <NavItem key={item.path} item={item} />)}

      {/* Center Plus FAB */}
      <div className="flex-1 flex items-center justify-center">
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.08 }}
          onClick={() => router.push('/admin/reels/create')}
          className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center shadow-[0_4px_20px_rgba(88,204,2,0.5)] border-4 border-white dark:border-slate-900 -mt-8"
          style={{ boxShadow: '0 4px 20px rgba(88,204,2,0.45)' }}
        >
          <Plus className="w-7 h-7 text-white" strokeWidth={3} />
        </motion.button>
      </div>

      {rightItems.map((item) => <NavItem key={item.path} item={item} />)}
    </nav>
  );
};

export default AdminBottomNav;
