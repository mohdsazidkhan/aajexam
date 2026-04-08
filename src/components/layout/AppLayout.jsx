import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Home,
  BookOpen,
  Gamepad2,
  BarChart2,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  Moon,
  Sun,
  Flame,
  LayoutDashboard,
  Bell,
  LogIn,
  Search,
  Layers
} from 'lucide-react';
import { toggleDarkMode } from '../../store/darkModeSlice';
import { toggleSidebar, closeSidebar, openSidebar } from '../../store/sidebarSlice';
import { useAuthStatus } from '../../hooks/useClientSide';
import { isAdmin } from '../../lib/utils/adminUtils';

// New Navbars
import StudentNavbar from '../navbars/StudentNavbar';
import AdminNavbar from '../navbars/AdminNavbar';
import StudentBottomNav from '../navbars/StudentBottomNav';
import AdminBottomNav from '../navbars/AdminBottomNav';
import StudentSidebar from '../StudentSidebar';
import Sidebar from '../Sidebar';

/**
 * AppLayout - The core layout wrapper for the gamified experience.
 * Handles Sidebar (Desktop), Top Navbar (Global), and Bottom Nav (Mobile).
 */
const AppLayout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isClient } = useAuthStatus();
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const isSidebarOpen = useSelector((state) => state.sidebar?.isOpen ?? false);

  const navItems = [
    { name: 'HOME', path: '/home', icon: Home },
    { name: 'EXAMS', path: '/govt-exams', icon: BookOpen },
    { name: 'SEARCH', path: '/search', icon: Search },
    { name: 'ANALYTICS', path: '/my-analytics', icon: BarChart2 },
    { name: 'PROFILE', path: '/profile', icon: User },
  ];

  const isQuestPage = (router.pathname.includes('/govt-exams/test/') && router.pathname.endsWith('/start'));
  const showAppNav = isAuthenticated && isClient && !isQuestPage;
  const isUserAdmin = isAdmin();

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'} transition-colors duration-500 font-nunito selection:bg-primary-500 selection:text-white`}>

      {/* --- Top Navbar (Global for Authenticated Users) --- */}
      {showAppNav && (
        isUserAdmin ? <AdminNavbar /> : <StudentNavbar />
      )}

      {/* --- Mobile Sidebar Overlay --- */}
      <AnimatePresence>
        {showAppNav && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeSidebar())}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[130] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- Sidebar (Desktop/Mobile) --- */}
      {showAppNav && (
        isUserAdmin ? <Sidebar /> : <StudentSidebar />
      )}

      {/* --- Main Content Area --- */}
      <main className={`transition-all duration-500 min-h-screen
        ${showAppNav ?
          (isSidebarOpen ? 'lg:ml-80 pt-16 pb-16 lg:pb-12' : 'ml-0 pt-16 px-0 pb-16') :
          (isQuestPage ? 'p-0 m-0 w-full overflow-hidden' : 'pt-16')
        }`}
      >
        <div className={`mx-auto transition-all duration-500 ${showAppNav ? 'px-4' : (isQuestPage ? 'max-w-full px-0' : 'px-0 md:px-6')}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={router.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* --- Bottom Nav (Mobile/Tablet Small) --- */}
      {showAppNav && (
        <>
          {isUserAdmin ? <AdminBottomNav /> : <StudentBottomNav />}
        </>
      )}
    </div>
  );
};

export default AppLayout;

