import React, { useState, useEffect, useLayoutEffect } from 'react';
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
import { toggleSidebar, closeSidebar, openSidebar } from '../../store/sidebarSlice';
import { useAuthStatus } from '../../hooks/useClientSide';
import { isAdmin } from '../../lib/utils/adminUtils';

// New Navbars
import StudentNavbar from '../student/Navbar';
import AdminNavbar from '../admin/Navbar';
import StudentBottomNav from '../student/BottomNav';
import AdminBottomNav from '../admin/BottomNav';
import StudentSidebar from '../student/Sidebar';
import Sidebar from '../Sidebar';
import UnifiedFooter from '../UnifiedFooter';
import AdminMobileFilterDrawer from '../admin/MobileFilterDrawer';
import { AdminMobileHeaderProvider } from '../../contexts/AdminMobileHeaderContext';

const AppLayout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isClient } = useAuthStatus();
  const isSidebarOpen = useSelector((state) => state.sidebar?.isOpen ?? false);

  const isQuestPage = (router.pathname.includes('/govt-exams/test/') && router.pathname.endsWith('/start'));
  const isQuizAttemptPage = router.pathname.includes('/quiz/') && router.pathname.endsWith('/attempt');
  const isFullscreenPage = isQuestPage || isQuizAttemptPage;
  const showAppNav = isAuthenticated && isClient && !isFullscreenPage;
  const isUserAdmin = isAdmin();
  const isAdminRoute = router.pathname.startsWith('/admin');
  // Server-side already 403s any non-admin call to /api/admin/**, so this is a UX
  // guard (send them home instead of showing a shell with broken data), not the
  // actual security boundary — individual pages don't each need their own check.
  const isBlockedFromAdmin = isClient && isAuthenticated && isAdminRoute && !isUserAdmin;

  useEffect(() => {
    if (isBlockedFromAdmin) router.replace('/home');
  }, [isBlockedFromAdmin, router]);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isReelsPage = router.pathname === '/reels';
  const isSearchPage = router.pathname === '/search';
  const shouldShiftContent = showAppNav && isSidebarOpen && isDesktop;

  // Lock body scroll on Reels page
  useEffect(() => {
    if (isReelsPage) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.documentElement.style.height = '';
        document.body.style.height = '';
      };
    }
  }, [isReelsPage]);

  // ── Non-admin trying to view an admin page: block the shell, don't mount it ──
  if (isBlockedFromAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-page font-outfit p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-sm rounded-[2.5rem] p-5 lg:p-10 border-2 border-slate-200 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-[2rem] mb-8 shadow-sm border-2 border-white dark:border-slate-800">
            <svg className="w-10 h-10 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Admin Only</h2>
          <p className="text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px] font-black leading-relaxed">
            Redirecting you back home...
          </p>
        </div>
      </div>
    );
  }

  // ── Search: top navbar + bottom nav on all breakpoints ──
  if (isSearchPage) {
    return (
      <div className="min-h-screen bg-background-page font-nunito">
        {showAppNav && !isUserAdmin && <StudentNavbar />}
        <AnimatePresence>
          {showAppNav && isSidebarOpen && !isDesktop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(closeSidebar())}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[130]"
            />
          )}
        </AnimatePresence>
        {showAppNav && !isUserAdmin && <StudentSidebar />}
        <div
          style={{
            marginLeft: shouldShiftContent ? '240px' : '0px',
            width: shouldShiftContent ? 'calc(100% - 240px)' : '100%',
            transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
          }}
          className="pt-12 lg:pt-16"
        >
          {children}
        </div>
        {showAppNav && !isUserAdmin && <StudentBottomNav />}
      </div>
    );
  }

  // ── Reels: fully immersive fixed layout, navbar on desktop ──
  if (isReelsPage) {
    return (
      <div className="fixed inset-0 font-nunito" style={{ overflow: 'hidden', height: '100dvh', touchAction: 'none' }}>
        {showAppNav && !isUserAdmin && (
          <div className="hidden lg:block">
            <StudentNavbar />
          </div>
        )}
        <AnimatePresence>
          {showAppNav && isSidebarOpen && !isDesktop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(closeSidebar())}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[130]"
            />
          )}
        </AnimatePresence>
        {showAppNav && !isUserAdmin && <StudentSidebar />}
        <div className="h-full lg:pt-16" style={{ overflow: 'hidden' }}>
          {children}
        </div>
        {showAppNav && !isUserAdmin && (
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <StudentBottomNav />
          </div>
        )}
      </div>
    );
  }

  return (
    <AdminMobileHeaderProvider>
    <div className="min-h-screen bg-background-page transition-colors duration-500 font-nunito selection:bg-primary-600 selection:text-white">

      {/* --- Top Navbar --- */}
      {showAppNav && (
        isUserAdmin ? <AdminNavbar /> : <StudentNavbar />
      )}

      {/* --- Mobile filter drawer (admin only) --- */}
      {showAppNav && isUserAdmin && <AdminMobileFilterDrawer />}

      {/* --- Sidebar Overlay (mobile) --- */}
      <AnimatePresence>
        {showAppNav && isSidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeSidebar())}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[130]"
          />
        )}
      </AnimatePresence>

      {/* --- Sidebar --- */}
      {showAppNav && (
        isUserAdmin ? <Sidebar /> : <StudentSidebar />
      )}

      {/* --- Main Content Area --- */}
      <main
        style={{
          marginLeft: shouldShiftContent ? '240px' : '0px',
          width: shouldShiftContent ? 'calc(100% - 240px)' : '100%',
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
        }}
        className={`min-h-screen
          ${showAppNav ?
            'pt-12 lg:pt-16 pb-10 lg:pb-0' :
            (isFullscreenPage ? 'p-0 m-0 overflow-hidden' : 'pt-12 lg:pt-16')
          }`}>
        <div className={`mx-auto transition-all duration-500 ${isFullscreenPage ? 'max-w-full px-0' : 'container px-4 lg:px-8'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={router.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        {!isUserAdmin && isDesktop && !isFullscreenPage && <UnifiedFooter />}
      </main>

      {/* --- Bottom Nav (Mobile only) --- */}
      {showAppNav && (
        isUserAdmin ? <AdminBottomNav /> : <StudentBottomNav />
      )}
    </div>
    </AdminMobileHeaderProvider>
  );
};

export default AppLayout;
