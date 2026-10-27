'use client';
import React, { useState, useEffect } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { m as motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Gift, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import useTranslate from '../../hooks/useTranslate';
import { trackPrompt } from '../../lib/tracker';
import { getFreePromoEnd } from '../../lib/freePromo';

const PROMO_FEATURES = [
  'Unlimited Practice Tests',
  'All Previous Year Papers (PYQs)',
  'Full-Length Mock Tests',
  'All India Rank in All Exams & Quizzes',
  'All Quizzes, Subjects & Topics',
  'Daily Challenges & Revisions & Bookmarks',
];

const WelcomePromoModalInner = ({ onClose }) => {
  const { translate } = useTranslate();
  useEffect(() => { trackPrompt('welcome', 'shown'); }, []);
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
          toast.success(translate('Welcome to AajExam! 🎉 Your free PRO access is unlocked.'));
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden bg-background-surface rounded-3xl border border-primary-500/20"
      >
        <button aria-label={translate('Close')}
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-background-surface-secondary text-content-muted hover:text-content-primary dark:hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-6 text-center relative overflow-hidden">

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-white dark:border-slate-800">
              <Gift className="w-6 h-6 text-primary-600" />
            </div>

            <h2 className="text-lg xl:text-xl font-bold font-outfit tracking-tight text-content-primary mb-1">
              {translate('PRO is now FREE for everyone!')}
            </h2>
            <p className="text-xs font-bold text-content-secondary mb-2 max-w-sm mx-auto">
              {translate('Already registered? You already have PRO for free, just log in. New here? Sign up and get PRO free instantly.')}
            </p>
            <p className="text-xl xl:text-2xl font-bold font-outfit tracking-tight text-primary-600 mb-4">
              {translate('FREE till 31 Dec 2026')}
            </p>

            <div className="space-y-1.5 mb-4 text-left max-w-sm mx-auto">
              {PROMO_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-xs font-bold text-content-secondary">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-primary-600 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  {translate(feature)}
                </div>
              ))}
            </div>

            <button
              onClick={() => { trackPrompt('welcome', 'click'); googleSignup(); }}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase tracking-[0.08em] rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition disabled:opacity-70 group border-b-2 border-slate-700 dark:border-slate-300 active:border-b-0 active:translate-y-1"
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
              {isGoogleLoading ? translate('Signing in...') : translate('Get PRO Free Now')}
            </button>
            <p className="mt-2 text-[9px] text-red-600 dark:text-red-400 font-bold uppercase tracking-[0.08em]">{translate('Offer valid till 31 Dec 2026')}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const WelcomePromoModal = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) return; // Authenticated users don't see this

    // Once per browser session: refreshing the landing page must not re-nag.
    try { if (sessionStorage.getItem('welcomePromoShown')) return; } catch (e) { /* ignore */ }
    // Free promo ends when the next pop-up coupon starts (31 Dec 2026 11:59 PM IST by default).
    let cancelled = false;
    let timer;
    getFreePromoEnd().then((end) => {
      if (cancelled || Date.now() >= end.getTime()) return;
      timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem('welcomePromoShown', 'true');
      }, 1200);
    });

    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  // The coupon "Coming soon" teaser waits for this pop-up so the two never stack.
  useEffect(() => {
    window.__welcomePromoOpen = show;
    if (!show) window.dispatchEvent(new Event('welcomePromoClosed'));
    return () => { window.__welcomePromoOpen = false; };
  }, [show]);

  const handleClose = () => setShow(false);

  if (!show) return null;

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!googleClientId || googleClientId === 'your_google_client_id_here') {
    return (
      <AnimatePresence>
        <WelcomePromoModalInner onClose={handleClose} />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <GoogleOAuthProvider clientId={googleClientId}>
        <WelcomePromoModalInner onClose={handleClose} />
      </GoogleOAuthProvider>
    </AnimatePresence>
  );
};

export default WelcomePromoModal;
