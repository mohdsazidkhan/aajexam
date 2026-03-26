import '../styles/index.css';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Head from 'next/head';
import { useEffect } from 'react';
import Script from 'next/script';
import store from '../store';
import { initializeDarkMode } from '../store/darkModeSlice';
import { GlobalErrorProvider } from '../contexts/GlobalErrorContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import UnifiedNavbar from '../components/UnifiedNavbar';
import AdminNavbar from '../components/AdminNavbar';
import MobileBottomNavigation from '../components/MobileBottomNavigation';
import AdminMobileBottomNavigation from '../components/AdminMobileBottomNavigation';
import StudentLayout from '../components/StudentLayout';
import { useRouter } from 'next/router';
import { isAdmin } from '../lib/utils/adminUtils';
import { hasAdminPrivileges } from '../lib/utils/adminUtils';
import Sidebar from '../components/Sidebar';
import ClientOnly from '../components/ClientOnly';
import CookieConsent from '../components/CookieConsent';
import '../styles/App.css';
import '../styles/darkMode.css';
import '../styles/responsive.css';
import '../styles/studentLayout.css';
import * as gtag from '../lib/gtag';

// Global styles for quiz page mobile optimization
const globalStyles = `
  /* Mobile Viewport and Touch Scrolling Fixes */
  html, body {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: manipulation;
  }

  body {
    position: relative;
    min-height: 100vh;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }

  /* Fullscreen Mode Scroll Fixes */
  body.quiz-fullscreen-mode {
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    height: auto !important;
    min-height: 100vh !important;
  }

  body.quiz-fullscreen-mode html {
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  /* Ensure fullscreen content is scrollable */
  body.quiz-fullscreen-mode .min-h-screen {
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    height: auto !important;
    min-height: 100vh !important;
  }

  /* Mobile Spacing Reductions for Quiz Page */
  @media (max-width: 767px) {
    .space-y-3 > * + * {
      margin-top: 0.5rem !important;
    }
    
    .space-y-4 > * + * {
      margin-top: 0.75rem !important;
    }
    
    .space-y-6 > * + * {
      margin-top: 1rem !important;
    }
    
    .space-y-8 > * + * {
      margin-top: 1.25rem !important;
    }
    
    .mb-4 {
      margin-bottom: 0.75rem !important;
    }
    
    .mb-6 {
      margin-bottom: 1rem !important;
    }
    
    .mb-8 {
      margin-bottom: 1.25rem !important;
    }
    
    .py-4 {
      padding-top: 0.75rem !important;
      padding-bottom: 0.75rem !important;
    }
    
    .py-6 {
      padding-top: 1rem !important;
      padding-bottom: 1rem !important;
    }
    
    .py-8 {
      padding-top: 1.25rem !important;
      padding-bottom: 1.25rem !important;
    }
  }
`;
// App Layout Component that can use router
function AppLayout({ Component, pageProps }) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Initialize dark mode on app mount
  useEffect(() => {
    dispatch(initializeDarkMode());
  }, [dispatch]);

  // Google Analytics page view tracking on route change
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    // Track the initial page load as well
    handleRouteChange(router.asPath);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, router.asPath]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </Head>
      {/* Google Analytics scripts */}
      {gtag.GA_MEASUREMENT_ID && (typeof window !== 'undefined' && window.location.hostname !== 'localhost') ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);} 
              gtag('js', new Date());
              gtag('config', '${gtag.GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      ) : null}

      {/* Landing page and public pages - no layout wrapper */}
      {router.pathname === '/' || router.pathname.startsWith('/categories') || router.pathname.startsWith('/subcategories') || router.pathname.startsWith('/exams') || router.pathname.startsWith('/levels') ? (
        <main id="main-content" className="h-full">
          <div className="appContainer">
            {Component && <Component {...pageProps} />}
          </div>
          <ClientOnly>
            <MobileBottomNavigation />
          </ClientOnly>
        </main>
      ) : router.pathname.startsWith('/admin') ? (
        <main id="main-content" className="h-full">
          {/* Admin Navbar shows only on admin pages */}
          <ClientOnly>
            <AdminNavbar />
          </ClientOnly>

          {/* Sidebar only for admin users */}
          <ClientOnly>
            {isAdmin() && hasAdminPrivileges() && <Sidebar />}
          </ClientOnly>

          <div className={`appContainer ${router.pathname !== '/' ? 'has-navbar' : ''}`}>
            {Component && <Component {...pageProps} />}
          </div>

          {/* Admin Mobile Bottom Navigation shows only on admin pages */}
          <ClientOnly>
            <AdminMobileBottomNavigation />
          </ClientOnly>
        </main>
      ) : (
        <main id="main-content" className="h-full">
          {/* Student Layout with Sidebar for student pages */}
          <ClientOnly>
            <StudentLayout>
              {Component && <Component {...pageProps} />}
            </StudentLayout>
          </ClientOnly>
        </main>
      )}
    </>
  );
}

export default function App({ Component, pageProps }) {
  // Get Google Client ID from environment variables
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // If no Google Client ID is provided, wrap without GoogleOAuthProvider
  if (!googleClientId || googleClientId === 'your_google_client_id_here') {
    console.warn('Google OAuth Client ID not configured. Google login will not work.');
    return (
      <Provider store={store}>
        <GlobalErrorProvider>
          <LanguageProvider>
            <AppLayout Component={Component} pageProps={pageProps} />
            <CookieConsent />
          </LanguageProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
              error: {
                duration: 5000,
                theme: {
                  primary: 'red',
                  secondary: 'black',
                },
              },
            }}
          />
        </GlobalErrorProvider>
      </Provider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <GlobalErrorProvider>
          <LanguageProvider>
            <AppLayout Component={Component} pageProps={pageProps} />
            <CookieConsent />
          </LanguageProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
              error: {
                duration: 5000,
                theme: {
                  primary: 'red',
                  secondary: 'black',
                },
              },
            }}
          />
        </GlobalErrorProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}
