import '../styles/index.css';
import { Provider, useDispatch } from 'react-redux';
import Head from 'next/head';
import { useEffect } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import store from '../store';
import { initializeDarkMode } from '../store/darkModeSlice';
import { GlobalErrorProvider } from '../contexts/GlobalErrorContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { useRouter } from 'next/router';
import ClientOnly from '../components/ClientOnly';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/App.css';
import '../styles/darkMode.css';
import '../styles/responsive.css';
import '../styles/studentLayout.css';
import * as gtag from '../lib/gtag';
import { Outfit, Nunito } from 'next/font/google';

const Toaster = dynamic(
  () => import('react-hot-toast').then((m) => m.Toaster),
  { ssr: false }
);

const CookieConsent = dynamic(() => import('../components/CookieConsent'), {
  ssr: false,
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

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
import UnifiedFooter from '../components/UnifiedFooter';
import { useAuthStatus } from '../hooks/useClientSide';

const toastOptions = {
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
    maxWidth: '400px',
  },
  success: {
    iconTheme: { primary: '#58cc02', secondary: '#fff' },
    style: { borderLeft: '4px solid #58cc02' },
  },
  error: {
    iconTheme: { primary: '#ff4b4b', secondary: '#fff' },
    style: { borderLeft: '4px solid #ff4b4b' },
  },
};

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
            {Component && <Component {...pageProps} />}
          </AppLayout>
        </ClientOnly>
      );
    }

    return (
      <main id="main-content" className="min-h-screen pt-16 lg:pt-20">
        <ClientOnly>
           <PublicNavbar />
        </ClientOnly>
        <div className="appContainer p-4">
          {Component && <Component {...pageProps} />}
        </div>
        <UnifiedFooter />
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
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`} strategy="lazyOnload" />
          <Script id="gtag-init" strategy="lazyOnload">
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
        <div className={`${outfit.variable} ${nunito.variable}`}>
          {renderContent()}
        </div>
      </ErrorBoundary>
    </>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <GlobalErrorProvider>
        <LanguageProvider>
          <AppContent Component={Component} pageProps={pageProps} />
          <CookieConsent />
        </LanguageProvider>
        <Toaster position="top-right" containerStyle={{ top: 80 }} toastOptions={toastOptions} />
      </GlobalErrorProvider>
    </Provider>
  );
}
