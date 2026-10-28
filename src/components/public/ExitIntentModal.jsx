'use client';
import React, { useState, useEffect } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { m as motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Gift, X, CheckCircle2, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import useTranslate from '../../hooks/useTranslate';
import { trackPrompt } from '../../lib/tracker';
import { useFreePromoActive } from '../../lib/freePromo';

const ExitIntentModalInner = ({ onClose }) => {
  const { translate, rich } = useTranslate();
  useEffect(() => { trackPrompt('exit', 'shown'); }, []);
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showLead, setShowLead] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailDone, setEmailDone] = useState(false);

  const submitEmail = async (e) => {
    e.preventDefault();
    if (emailBusy || !email.trim() || !phone.trim()) return;
    setEmailBusy(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim(), source: 'exit', path: window.location.pathname }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        trackPrompt('email', 'click');
        setEmailDone(true);
      } else {
        toast.error(translate(data.message || 'Please enter a valid email.'));
      }
    } catch (err) {
      toast.error(translate('Something went wrong. Please try again.'));
    } finally {
      setEmailBusy(false);
    }
  };
  const promoActive = useFreePromoActive();

  const googleSignup = useGoogleLogin({
    onSuccess: async (response) => {
      setIsGoogleLoading(true);
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` }
        }).then((res) => res.json());

        const authRes = await API.googleAuth({
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        });

        if (authRes.success) {
          localStorage.setItem('userInfo', JSON.stringify(authRes.user));
          localStorage.setItem('token', authRes.token);
          window.dispatchEvent(new CustomEvent('authStateChanged'));
          toast.success(translate('Welcome to AajExam! 🎉 Your free mock test is unlocked.'));
          onClose();
          router.push(authRes.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        }
      } catch (error) {
        toast.error(translate('Google sign-up failed. Please try again.'));
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error(translate('Google sign-up was cancelled.'));
      setIsGoogleLoading(false);
    },
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-background-surface rounded-3xl border border-primary-500/30 overflow-hidden max-h-[70vh] flex flex-col"
      >
        {/* Header: gradient band with the offer */}
        <div className="relative shrink-0 px-5 pt-5 pb-5 text-center text-on-primary overflow-hidden bg-primary-600">
          <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full pointer-events-none" />
          <div className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full pointer-events-none" />

          <button aria-label={translate('Close')}
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl flex items-center justify-center ring-4 ring-white/20">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-outfit tracking-tight leading-tight mb-2">
              {translate(promoActive ? 'Wait! Your FREE PRO is waiting.' : 'Wait! Don\'t Leave Empty Handed.')}
            </h2>
            {promoActive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background-surface text-primary-600 text-[11px] sm:text-xs font-bold uppercase tracking-[0.08em] animate-pulse">
                <Gift className="w-3.5 h-3.5" />
                {translate('PRO FREE till 31 Dec 2026')}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 text-center overflow-y-auto min-h-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-content-secondary mb-3 max-w-xs mx-auto">
            {promoActive
              ? translate('Sign up in 10 seconds and unlock full PRO access. No card, no payment.')
              : rich('Sign up in 10 seconds to unlock a <0>Free Premium Mock Test</0> and personalized progress tracking.', [(c) => <span className="text-primary-600 font-bold">{c}</span>])}
          </p>

          <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl border border-primary-500/30 px-3 py-2.5">
            <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0" />
            <p className="text-sm sm:text-base font-bold text-content-primary leading-snug">
              {translate('Everything in Unlimited FREE')}
            </p>
          </div>

          <button
            onClick={() => { trackPrompt('exit', 'click'); googleSignup(); }}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase tracking-[0.08em] text-sm rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition disabled:opacity-70 border-slate-700 dark:border-slate-300 active:border-b-0 active:translate-y-1"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border border-slate-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {isGoogleLoading ? translate('Signing in...') : translate(promoActive ? 'Get PRO Free Now' : 'Claim Free Account')}
          </button>
          {promoActive ? (
            <p className="mt-2 text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-[0.08em]">{translate('Offer valid till 31 Dec 2026')}</p>
          ) : (
            <p className="mt-2 text-[10px] text-content-muted font-bold uppercase tracking-[0.08em]">{translate('Takes only 10 seconds')}</p>
          )}

          {/* Not ready for Google yet: keep the visitor with an email + mobile number instead of losing them */}
          <div className="mt-3 pt-3 border-t border-border-primary">
            {emailDone ? (
              <p className="text-xs font-bold text-primary-600">{translate('Thanks! We will contact you before the free PRO offer ends.')}</p>
            ) : !showLead ? (
              <button
                type="button"
                onClick={() => setShowLead(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-content-muted hover:text-primary-600 underline underline-offset-2"
              >
                {translate('Not ready yet? Share your email & mobile number for free test updates and offer reminders.')}
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              </button>
            ) : (
              <form onSubmit={submitEmail} className="max-w-sm mx-auto space-y-2">
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={translate('Your email')}
                  aria-label={translate('Your email')}
                  className="w-full px-3 py-2.5 rounded-xl border border-border-primary bg-background-surface text-sm font-semibold text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  maxLength={14}
                  pattern="[0-9+ ]{10,14}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9+ ]/g, ''))}
                  placeholder={translate('Your mobile number')}
                  aria-label={translate('Your mobile number')}
                  className="w-full px-3 py-2.5 rounded-xl border border-border-primary bg-background-surface text-sm font-semibold text-content-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={emailBusy}
                  className="w-full px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-on-primary text-xs font-bold uppercase tracking-[0.08em] disabled:opacity-70"
                >
                  {emailBusy ? '...' : translate('Notify me')}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ExitIntentModal = () => {
  const [show, setShow] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth from local storage (app standard)
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      return;
    }

    // Has it been shown already in this session?
    const hasShown = sessionStorage.getItem('exitIntentShown');
    if (hasShown) return;

    let armed = false;
    let fired = false;
    let idleTimer;
    let tabHidden = false;
    let lastY = window.scrollY;
    let upFrom = null;
    const cleanups = [];

    const fire = () => {
      if (fired || !armed) return;
      // Never stack on top of the welcome promo modal; the next signal will retry.
      if (window.__welcomePromoOpen) return;
      fired = true;
      setShow(true);
      sessionStorage.setItem('exitIntentShown', 'true');
      teardown();
    };

    // Desktop: mouse leaves the top of the viewport (towards tabs / close button)
    const onMouseLeave = (e) => { if (e.clientY <= 0) fire(); };

    // Desktop + mobile: user switches tab / app away and comes back
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') tabHidden = true;
      else if (tabHidden) fire();
    };

    // Mobile: back button. One dummy history entry, same URL, so the first Back shows the modal.
    const onPopState = () => fire();

    // Mobile: a quick scroll back up towards the address bar / menu
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY) {
        if (upFrom === null) upFrom = lastY;
        if (upFrom - y >= 300 && upFrom > 600) fire();
      } else {
        upFrom = null;
      }
      lastY = y;
    };

    // Everyone: gone quiet for 30 seconds
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(fire, 30000);
    };
    const idleEvents = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];

    function teardown() {
      clearTimeout(idleTimer);
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
    }

    const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    // Small delay before arming, so it doesn't trigger immediately on load
    const armTimer = setTimeout(() => {
      armed = true;
      document.addEventListener('mouseleave', onMouseLeave);
      document.addEventListener('visibilitychange', onVisibility);
      idleEvents.forEach((ev) => window.addEventListener(ev, resetIdle, { passive: true }));
      cleanups.push(() => {
        document.removeEventListener('mouseleave', onMouseLeave);
        document.removeEventListener('visibilitychange', onVisibility);
        idleEvents.forEach((ev) => window.removeEventListener(ev, resetIdle));
      });
      resetIdle();
      if (isTouch) {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('popstate', onPopState);
        cleanups.push(() => {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('popstate', onPopState);
        });
        try {
          window.history.pushState({ exitIntentTrap: true }, '', window.location.href);
        } catch (e) { /* history unavailable */ }
      }
    }, 2000);

    return () => {
      clearTimeout(armTimer);
      teardown();
    };
  }, [isAuthenticated]);

  if (!show) return null;

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!googleClientId || googleClientId === 'your_google_client_id_here') {
    return (
      <AnimatePresence>
        <ExitIntentModalInner onClose={() => setShow(false)} />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <GoogleOAuthProvider clientId={googleClientId}>
        <ExitIntentModalInner onClose={() => setShow(false)} />
      </GoogleOAuthProvider>
    </AnimatePresence>
  );
};

export default ExitIntentModal;
