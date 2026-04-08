import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import { initializeDarkMode } from '../store/darkModeSlice';
import ScrollToTopButton from './ScrollToTopButton';

const MobileAppWrapper = ({ children, title, showHeader = true }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeDarkMode());
  }, [dispatch]);

  const isAdminPage = router.pathname?.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  // _app.js handles navbar, footer, and bottom nav globally.
  // MobileAppWrapper only wraps content and adds scroll-to-top.
  return (
    <div className="mobile-app-container min-h-screen">
      <main className={`mobile-content`}>
        {children}
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default MobileAppWrapper;

