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
import UnifiedFooter from '../UnifiedFooter';

const AppLayout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isClient } = useAuthStatus();
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const isSidebarOpen = useSelector((state) => state.sidebar?.isOpen ?? false);

  const isQuestPage = (router.pathname.includes('/govt-exams/test/') && router.pathname.endsWith('/start'));
  const showAppNav = isAuthenticated && isClient && !isQuestPage;
  const isUserAdmin = isAdmin();

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

  // ── Search: hide header, keep bottom nav ──
  if (isSearchPage) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'} font-nunito`}>
        {children}
        {showAppNav && !isUserAdmin && <StudentBottomNav />}
      </div>
    );
  }

  // ── Reels: fully immersive fixed layout ──
  if (isReelsPage) {
    return (
      <div className={`fixed inset-0 ${darkMode ? 'dark' : ''} font-nunito`} style={{ overflow: 'hidden', height: '100dvh', touchAction: 'none' }}>
        <div style={{ height: '100%', overflow: 'hidden' }}>
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
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'} transition-colors duration-500 font-nunito selection:bg-primary-500 selection:text-white`}>

      {/* --- Top Navbar --- */}
      {showAppNav && (
        isUserAdmin ? <AdminNavbar /> : <StudentNavbar />
      )}

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
            'pt-16 lg:pt-20 pb-10 lg:pb-0 px-4 lg:px-0' :
            (isQuestPage ? 'p-0 m-0 overflow-hidden' : 'pt-12 lg:pt-20')
          }`}
      >
        <div className={`mx-auto transition-all duration-500 ${showAppNav ? 'max-w-[1200px]' : (isQuestPage ? 'max-w-full px-0' : 'px-4 md:px-6 max-w-[1200px]')}`}>
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
        {!isUserAdmin && isDesktop && <UnifiedFooter />}
      </main>

      {/* --- Bottom Nav (Mobile only) --- */}
      {showAppNav && (
        isUserAdmin ? <AdminBottomNav /> : <StudentBottomNav />
      )}
    </div>
  );
};

export default AppLayout;
