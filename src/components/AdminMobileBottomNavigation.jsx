import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useClientSide, useAuthStatus } from '../hooks/useClientSide';
import {
  FaUsers,
  FaBook,
  FaQuestionCircle,
  FaMoneyBill,
  FaCalendarAlt
} from 'react-icons/fa';
import { MdDashboard, MdAnalytics, MdQuestionAnswer } from 'react-icons/md';
import { getCurrentUser } from '../lib/utils/authUtils';
import { isAdmin } from '../lib/utils/adminUtils';

const AdminMobileBottomNavigation = () => {
  const router = useRouter();
  const isClient = useClientSide();
  const { user } = useAuthStatus();

  // Don't show on non-admin pages
  if (!isClient || !router.pathname.startsWith('/admin') || !user || !isAdmin()) {
    return null;
  }

  const adminNavItems = [
    {
      path: '/admin/dashboard',
      icon: MdDashboard,
      label: 'Dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    {
      path: '/admin/analytics/dashboard',
      icon: MdAnalytics,
      label: 'Analytics',
      color: 'from-purple-500 from-red-600'
    },
    {
      path: '/admin/students',
      icon: FaUsers,
      label: 'Students',
      color: 'from-green-500 to-green-600'
    },
    {
      path: '/admin/questions',
      icon: MdQuestionAnswer,
      label: 'Questions',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      path: '/admin/subscriptions',
      icon: FaCalendarAlt,
      label: 'Plans',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      path: '/admin/payment-transactions',
      icon: FaMoneyBill,
      label: 'Payments',
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Admin Mobile Bottom Navigation */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center w-20 h-12 transition-all duration-300 ${isActive
                    ? 'bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700 dark:from-yellow-500 dark:to-red-500 dark:hover:from-yellow-600 dark:hover:to-red-600 text-white dark:text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-xl dark:shadow-yellow-500/25 hover:dark:shadow-yellow-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminMobileBottomNavigation;