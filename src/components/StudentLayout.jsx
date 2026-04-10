import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StudentNavbar from './navbars/StudentNavbar';
import StudentSidebar from './StudentSidebar';
import StudentBottomNav from './navbars/StudentBottomNav';
import { initializeDarkMode } from '../store/darkModeSlice';
import { closeSidebar } from '../lib/store/sidebarSlice';
import { isAuthenticated, getCurrentUser } from '../lib/utils/authUtils';
import { useSSR } from '../hooks/useSSR';
import ClientOnly from './ClientOnly';

const StudentLayout = ({ children }) => {
  const { isMounted, router } = useSSR();
  const pathname = router?.pathname || '';
  const isStartPage = pathname?.includes('/start');
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  const initializedRef = useRef(false);
  const lastWidthRef = useRef(null);

  // Check if current page should hide sidebar
  const shouldHideSidebar = (() => {
    const pathname = router?.pathname || '';
    // Hide only on test start pages (/govt-exams/test/[testId]/start), not on /govt-exams/test listing
    if (pathname?.startsWith('/govt-exams/test/') && pathname?.includes('/start')) {
      return true;
    }
    return false;
  })();

  // Full-screen immersive pages — hide navbar, sidebar, bottom nav
  const isImmersivePage = pathname === '/reels';

  useEffect(() => {
    if (isMounted) {
      dispatch(initializeDarkMode());

      // Initialize sidebar state only once on mount
      if (!initializedRef.current) {
        // Force close sidebar on pages that should hide it, otherwise rely on default state
        if (shouldHideSidebar) {
          dispatch(closeSidebar());
        }
        initializedRef.current = true;
        lastWidthRef.current = window.innerWidth;
      }

      // Handle window resize - only close if moving to mobile
      const handleResize = () => {
        const currentWidth = window.innerWidth;
        const isMobile = currentWidth < 768;
        const pathname = router?.pathname || '';
        const currentShouldHideSidebar =
          pathname.startsWith('/govt-exams/test/') && pathname.includes('/start');

        if (isMobile || currentShouldHideSidebar) {
          dispatch(closeSidebar());
        }

        lastWidthRef.current = currentWidth;
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isMounted, dispatch, authenticated, user, router?.pathname]);

  // Close sidebar when navigating to pages that should hide it
  useEffect(() => {
    if (isMounted && router?.pathname && shouldHideSidebar && isOpen) {
      dispatch(closeSidebar());
    }
  }, [isMounted, router?.pathname, shouldHideSidebar, isOpen, dispatch]);

  // Don't render during SSR
  if (!isMounted) {
    return <>{children}</>;
  }

  // Don't show layout on landing page
  if (router?.pathname === '/') {
    return <>{children}</>;
  }

  // Full-screen immersive pages — no layout wrapper
  if (isImmersivePage) {
    return <>{children}</>;
  }

  // Don't show student layout on admin pages
  if (router?.pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Show sidebar only if user is authenticated and not on pages that should hide it
  const showSidebar = authenticated && user && !shouldHideSidebar;

  return (
    <div className={`student-layout ${darkMode ? 'dark' : ''}`}>
      <ClientOnly>
        <StudentNavbar />
      </ClientOnly>
      <div className="student-layout-content" style={isStartPage ? { marginTop: 0 } : undefined}>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="sidebar-overlay active"
            onClick={() => dispatch(closeSidebar())}
          />
        )}
        {showSidebar && (
          <ClientOnly>
            <StudentSidebar />
          </ClientOnly>
        )}
        <main className={`student-main-content ${showSidebar && isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {children}
        </main>
      </div>
      <ClientOnly>
        <StudentBottomNav />
      </ClientOnly>
    </div>
  );
};

export default StudentLayout;

