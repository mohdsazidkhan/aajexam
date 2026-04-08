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
import StudentLayout from '../components/StudentLayout';
import { useRouter } from 'next/router';
import { isAdmin, hasAdminPrivileges } from '../lib/utils/adminUtils';
import Sidebar from '../components/Sidebar';
import ClientOnly from '../components/ClientOnly';
import CookieConsent from '../components/CookieConsent';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/App.css';
import '../styles/darkMode.css';
import '../styles/responsive.css';
import '../styles/studentLayout.css';
import * as gtag from '../lib/gtag';

// Global styles for mobile optimization
const globalStyles = `
  /* Mobile Viewport and Touch Scrolling Fixes */
  html, body {
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    touch-action: manipulation;
  }

  body {
    position: relative;
    min-height: 100vh;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
`;

// App Layout Component that can use router
import AppLayout from '../components/layout/AppLayout';
import PublicNavbar from '../components/navbars/PublicNavbar';
import PublicBottomNav from '../components/navbars/PublicBottomNav';
import { useAuthStatus } from '../hooks/useClientSide';

function PageWrapper({ children, route }) {
  return (
    <motion.div
      key={route}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeDarkMode());
  }, [dispatch]);

  useEffect(() => {
    const handleRouteChange = (url) => gtag.pageview(url);
    router.events.on('routeChangeComplete', handleRouteChange);
    handleRouteChange(router.asPath);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, router.asPath]);

  const { isAuthenticated, isClient } = useAuthStatus();

  const renderContent = () => {
    if (isClient && isAuthenticated) {
      return (
        <ClientOnly>
          <AppLayout>
            <PageWrapper route={router.asPath}>
              {Component && <Component {...pageProps} />}
            </PageWrapper>
          </AppLayout>
        </ClientOnly>
      );
    }

    return (
      <main id="main-content" className="min-h-screen pt-16 lg:pt-20">
        <ClientOnly>
           <PublicNavbar />
        </ClientOnly>
        <div className="appContainer px-4">
          <PageWrapper route={router.asPath}>
            {Component && <Component {...pageProps} />}
          </PageWrapper>
        </div>
        <ClientOnly>
          <PublicBottomNav />
        </ClientOnly>
      </main>
    );
  };

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
      {gtag.GA_MEASUREMENT_ID ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
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

      <ErrorBoundary>
        <AnimatePresence mode="wait" initial={false}>
          {renderContent()}
        </AnimatePresence>
      </ErrorBoundary>
    </>
  );
}

export default function App({ Component, pageProps }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId || googleClientId === 'your_google_client_id_here') {
    return (
      <Provider store={store}>
        <GlobalErrorProvider>
          <LanguageProvider>
            <AppContent Component={Component} pageProps={pageProps} />
            <CookieConsent />
          </LanguageProvider>
          <Toaster
            position="top-right"
            containerStyle={{ top: 80 }}
            toastOptions={{
              duration: 5000,
              className: 'premium-toast',
              style: { 
                background: 'var(--bg-surface)', 
                color: 'var(--text-primary)', 
                borderRadius: '1.25rem', 
                border: '1px solid var(--border-primary)', 
                backdropFilter: 'blur(16px) saturate(180%)',
                padding: '12px 20px',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                maxWidth: '400px'
              },
              success: { 
                iconTheme: { primary: '#58cc02', secondary: '#fff' },
                style: { borderLeft: '4px solid #58cc02' }
              },
              error: { 
                iconTheme: { primary: '#ff4b4b', secondary: '#fff' },
                style: { borderLeft: '4px solid #ff4b4b' }
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
            <AppContent Component={Component} pageProps={pageProps} />
            <CookieConsent />
          </LanguageProvider>
          <Toaster
            position="top-right"
            containerStyle={{ top: 80 }}
            toastOptions={{
              duration: 5000,
              className: 'premium-toast',
              style: { 
                background: 'var(--bg-surface)', 
                color: 'var(--text-primary)', 
                borderRadius: '1.25rem', 
                border: '1px solid var(--border-primary)', 
                backdropFilter: 'blur(16px) saturate(180%)',
                padding: '12px 20px',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                maxWidth: '400px'
              },
              success: { 
                iconTheme: { primary: '#58cc02', secondary: '#fff' },
                style: { borderLeft: '4px solid #58cc02' }
              },
              error: { 
                iconTheme: { primary: '#ff4b4b', secondary: '#fff' },
                style: { borderLeft: '4px solid #ff4b4b' }
              },
            }}
          />
        </GlobalErrorProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}
