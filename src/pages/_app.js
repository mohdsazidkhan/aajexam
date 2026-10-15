import '../styles/index.css';
import { Provider, useDispatch, useSelector } from 'react-redux';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { LazyMotion, MotionConfig } from 'framer-motion';
import store from '../store';
import { initializeDarkMode, syncSystemTheme } from '../store/darkModeSlice';
import { initializeThemeColor } from '../store/themeColorSlice';
import { initializeFont } from '../store/fontSlice';
import { initializeTextSize } from '../store/textSizeSlice';
import { initializeDisplay } from '../store/displaySlice';
import { GlobalErrorProvider } from '../contexts/GlobalErrorContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import PreferencesSync from '../components/PreferencesSync';
import { useRouter } from 'next/router';
import ClientOnly from '../components/ClientOnly';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/App.css';
import '../styles/darkMode.css';
import '../styles/studentLayout.css';
import * as gtag from '../lib/gtag';
import { inter, lato } from '../lib/fonts';
import { installGlobalErrorReporting } from '../lib/errorReporter';

const Toaster = dynamic(
  () => import('react-hot-toast').then((m) => m.Toaster),
  { ssr: false }
);

const CookieConsent = dynamic(() => import('../components/CookieConsent'), {
  ssr: false,
});

const ExitIntentModal = dynamic(() => import('../components/modals/ExitIntentModal'), {
  ssr: false,
});

const PageViewNudge = dynamic(() => import('../components/modals/PageViewNudge'), {
  ssr: false,
});

const WelcomePromoModal = dynamic(() => import('../components/modals/WelcomePromoModal'), {
  ssr: false,
});

const CouponOfferModal = dynamic(() => import('../components/modals/CouponOfferModal'), {
  ssr: false,
});

const TargetExamPrompt = dynamic(() => import('../components/TargetExamPrompt'), {
  ssr: false,
});

const CityPromptModal = dynamic(() => import('../components/modals/CityPromptModal'), {
  ssr: false,
});

const ProfileDetailsModal = dynamic(() => import('../components/modals/ProfileDetailsModal'), {
  ssr: false,
});

// Animation features download after first paint (see lib/motionFeatures.js); until then <m.*> elements render in
// their initial state.
const loadMotionFeatures = () => import('../lib/motionFeatures').then((mod) => mod.default);

// Mounts its children only once the browser is idle (or after `timeout` ms at the latest), so the
// chunks of non-essential widgets (promo modals, cookie banner) do not compete with the first paint.
function AfterIdle({ children, timeout = 4000 }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const run = () => { if (!cancelled) setReady(true); };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout });
      return () => { cancelled = true; window.cancelIdleCallback(id); };
    }
    const id = setTimeout(run, 2000);
    return () => { cancelled = true; clearTimeout(id); };
  }, [timeout]);
  return ready ? children : null;
}

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
  // The signed-in layout (navbars, sidebars, bottom navs) is only downloaded for signed-in visitors.
  const [AppLayout, setAppLayout] = useState(null);

  useEffect(() => {
    installGlobalErrorReporting();
  }, []);

  useEffect(() => {
    dispatch(initializeDarkMode());
    dispatch(initializeThemeColor());
    dispatch(initializeFont());
    dispatch(initializeTextSize());
    dispatch(initializeDisplay());
  }, [dispatch]);

  // Auto Dark/Light: follow the device setting live while "follow system" is on.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => dispatch(syncSystemTheme());
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [dispatch]);

  useEffect(() => {
    const handleRouteChange = (url) => gtag.pageview(url);
    router.events.on('routeChangeComplete', handleRouteChange);
    handleRouteChange(router.asPath);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, router.asPath]);

  const { isAuthenticated, isClient, authChecked } = useAuthStatus();
  const isAdminRoute = router.pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAuthenticated || AppLayout) return undefined;
    let cancelled = false;
    import('../components/layout/AppLayout').then((m) => { if (!cancelled) setAppLayout(() => m.default); });
    return () => { cancelled = true; };
  }, [isAuthenticated, AppLayout]);

  const renderContent = () => {
    // Until the client has mounted AND finished checking auth state, render a
    // minimal layout-agnostic shell. Gating on authChecked (not just isClient)
    // avoids briefly rendering the logged-out tree shape for a logged-in user
    // between hydration and the auth check resolving — that extra tree-shape
    // swap was remounting the page component and double-firing its data
    // fetches. This shell must NOT include any semantic wrapper elements like
    // <footer> or <nav> inside <main> that differ from what the client will
    // render after hydration — otherwise React throws a hydration mismatch
    // error.
    // (A signed-in visitor stays in this shell for the moment it takes the layout chunk to arrive.)
    if (!isClient || !authChecked || (isAuthenticated && !AppLayout)) {
      // Admin routes are noindex and always require auth, so there's no SEO/UX
      // reason to eagerly mount Component here — doing so mounts it once now
      // and again inside AppLayout once auth resolves, double-firing its data
      // fetches. Skip the eager mount for admin routes only; public/student
      // routes keep it for SSR/SEO and to avoid a blank-page flash.
      if (isAdminRoute) {
        return <div id="main-content" className="min-h-screen" />;
      }
      return (
        <div id="main-content" className="min-h-screen">
          {Component && <Component {...pageProps} />}
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <>
          <AppLayout>
            {Component && <Component {...pageProps} />}
          </AppLayout>
          <TargetExamPrompt />
          <CityPromptModal />
          <ProfileDetailsModal />
          <CouponOfferModal />
        </>
      );
    }

    return (
      <main id="main-content" className="min-h-screen pt-16">
        <PublicNavbar />
        <div className="appContainer px-4 xxl:px-8">
          {/* Every public page sits in the centred container column. The landing page ('/') is built from
              full-width bands that each carry their own inner container, so it is left unwrapped. */}
          {router.pathname === '/' ? (
            Component && <Component {...pageProps} />
          ) : (
            <div className="container mx-auto">
              {Component && <Component {...pageProps} />}
            </div>
          )}
        </div>
        <UnifiedFooter />
        <PublicBottomNav />
        <AfterIdle>
          <WelcomePromoModal />
          <ExitIntentModal />
          <PageViewNudge />
        </AfterIdle>
      </main>
    );
  };

  return (
    <>
      <PreferencesSync />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        {/* Anti-FOUC: apply dark class before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              var follow = localStorage.getItem('themeFollowSystem');
              if (follow === '1' || (follow === null && !theme)) {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              if (theme === 'dark' || !theme) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch(e) {}
            try {
              var flags = { liteMode: 'data-lite', reduceMotion: 'data-reduce-motion', eyeComfort: 'data-eye-comfort', pureBlack: 'data-pure-black', colorBlind: 'data-color-blind' };
              for (var key in flags) {
                if (localStorage.getItem(key) === '1') document.documentElement.setAttribute(flags[key], '1');
              }
            } catch(e) {}
          })();
        `}} />
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
        {/* inter is referenced here (not only in _document) so next/font emits its @font-face in the production CSS */}
        <div className={`${inter.variable} ${lato.variable}`}>
          {renderContent()}
        </div>
      </ErrorBoundary>
    </>
  );
}

// Reduce motion / Lite mode switch off framer-motion's movement for the whole app. Otherwise it
// follows the device's own "reduce motion" setting.
function MotionSettings({ children }) {
  const reduceMotion = useSelector((s) => s.display?.reduceMotion);
  const liteMode = useSelector((s) => s.display?.liteMode);
  return (
    <MotionConfig reducedMotion={reduceMotion || liteMode ? 'always' : 'user'}>
      {children}
    </MotionConfig>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <LazyMotion features={loadMotionFeatures}>
      <MotionSettings>
      <GlobalErrorProvider>
        <LanguageProvider>
          <AppContent Component={Component} pageProps={pageProps} />
          <AfterIdle><CookieConsent /></AfterIdle>
        </LanguageProvider>
        <Toaster position="top-right" containerStyle={{ top: 80 }} toastOptions={toastOptions} />
      </GlobalErrorProvider>
      </MotionSettings>
      </LazyMotion>
    </Provider>
  );
}
