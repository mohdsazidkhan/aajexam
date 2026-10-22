'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { m as motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider, useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { Gift, X, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import useTranslate from '../../hooks/useTranslate';
import { trackPrompt } from '../../lib/tracker';
import { getFreePromoEnd, useFreePromoActive } from '../../lib/freePromo';

// Pages where a signup bar would be noise (they already are the signup flow, or are legal pages).
const NO_BAR = /^\/(login|register|forgot-password|reset-password|terms|privacy|refund|disclaimer|halal-disclaimer|editorial-policy)?$/;
const NO_ONE_TAP = /^\/(forgot-password|reset-password)/;

// Exam named on the page, so the bar can speak to what the visitor is reading.
const EXAMS = [
  [/ssc[-_\s]?cgl/i, 'SSC CGL'], [/ssc[-_\s]?chsl/i, 'SSC CHSL'], [/ssc[-_\s]?gd/i, 'SSC GD'],
  [/ssc[-_\s]?cpo/i, 'SSC CPO'], [/ssc[-_\s]?mts/i, 'SSC MTS'], [/ssc[-_\s]?steno/i, 'SSC Stenographer'],
  [/rrb|railway|ntpc|group[-_\s]?d/i, 'Railway (RRB)'], [/upsc|\bias\b/i, 'UPSC'], [/neet/i, 'NEET'],
  [/ctet/i, 'CTET'], [/ibps/i, 'IBPS'], [/\bsbi\b/i, 'SBI'], [/police/i, 'Police'], [/bank/i, 'Banking'],
];
const examFromPath = (p) => {
  let path = p || '';
  try { path = decodeURIComponent(path); } catch (e) { /* keep raw */ }
  const hit = EXAMS.find(([rx]) => rx.test(path));
  return hit ? hit[1] : '';
};

// Decode the (already Google-verified) One Tap credential JWT into the profile fields our API takes.
const decodeCredential = (credential) => {
  const part = String(credential || '').split('.')[1];
  if (!part) return null;
  const json = decodeURIComponent(escape(atob(part.replace(/-/g, '+').replace(/_/g, '/'))));
  const p = JSON.parse(json);
  return p.sub && p.email ? { googleId: p.sub, email: p.email, name: p.name || p.email.split('@')[0], picture: p.picture } : null;
};

const useCountdown = (active) => {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    let timer;
    getFreePromoEnd().then((end) => {
      if (cancelled) return;
      const tick = () => setLeft(Math.max(0, end.getTime() - Date.now()));
      tick();
      timer = setInterval(tick, 60000);
    });
    return () => { cancelled = true; clearInterval(timer); };
  }, [active]);
  return left;
};

const Inner = () => {
  const { translate } = useTranslate();
  const router = useRouter();
  const promoActive = useFreePromoActive();
  const left = useCountdown(promoActive);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState(0);

  const path = router.asPath.split('?')[0].split('#')[0];
  const barAllowed = !NO_BAR.test(router.pathname) && router.pathname !== '/';
  const exam = examFromPath(path);

  const finish = useCallback(async (profile, prompt) => {
    setBusy(true);
    try {
      const authRes = await API.googleAuth(profile);
      if (authRes.success) {
        localStorage.setItem('userInfo', JSON.stringify(authRes.user));
        localStorage.setItem('token', authRes.token);
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        toast.success(translate('Welcome to AajExam! 🎉 Your free PRO access is unlocked.'));
        setOpen(false);
        router.push(authRes.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      }
    } catch (e) {
      toast.error(translate('Google sign-up failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  }, [router, translate]);

  const googleSignup = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then((r) => r.json());
        await finish({ googleId: info.sub, email: info.email, name: info.name, picture: info.picture }, 'sticky');
      } catch (e) {
        toast.error(translate('Google sign-up failed. Please try again.'));
      }
    },
    onError: () => toast.error(translate('Google sign-up was cancelled.')),
  });

  // Google One Tap: the native "Continue as <name>" card, one click to sign up.
  const [oneTapOn, setOneTapOn] = useState(false);
  useEffect(() => {
    if (NO_ONE_TAP.test(router.pathname)) return undefined;
    // One Tap never stacks on the welcome modal, and is offered once per session.
    const t = setTimeout(() => {
      try {
        if (window.__welcomePromoOpen || sessionStorage.getItem('oneTapTried')) return;
        sessionStorage.setItem('oneTapTried', '1');
      } catch (e) { /* ignore */ }
      setOneTapOn(true);
    }, 4000);
    return () => clearTimeout(t);
  }, [router.pathname]);

  useGoogleOneTapLogin({
    disabled: !oneTapOn,
    cancel_on_tap_outside: false,
    onSuccess: async (cred) => {
      try {
        trackPrompt('onetap', 'click');
        const profile = decodeCredential(cred.credential);
        if (profile) await finish(profile, 'onetap');
      } catch (e) {
        toast.error(translate('Google sign-up failed. Please try again.'));
      }
    },
    onError: () => {},
    promptMomentNotification: (n) => {
      try { if (n.isDisplayed && n.isDisplayed()) trackPrompt('onetap', 'shown'); } catch (e) { /* ignore */ }
    },
  });

  // Sticky bar: after some scrolling or 10 seconds, once per session unless dismissed.
  useEffect(() => {
    setOpen(false);
    if (!barAllowed) return undefined;
    try { if (sessionStorage.getItem('signupBarDismissed')) return undefined; } catch (e) { /* ignore */ }
    const show = () => { if (!window.__welcomePromoOpen) setOpen(true); };
    const onScroll = () => { if (window.scrollY > 300) { show(); window.removeEventListener('scroll', onScroll); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    const t = setTimeout(show, 10000);
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
  }, [router.asPath, barAllowed]);

  useEffect(() => { if (open) trackPrompt('sticky', 'shown'); }, [open]);

  useEffect(() => {
    if (!open || students) return;
    fetch('/api/public/student-count').then((r) => r.json()).then((d) => setStudents(d?.count || 0)).catch(() => {});
  }, [open, students]);

  const dismiss = () => {
    setOpen(false);
    try { sessionStorage.setItem('signupBarDismissed', '1'); } catch (e) { /* ignore */ }
  };

  const days = left === null ? 0 : Math.floor(left / 86400000);
  const hours = left === null ? 0 : Math.floor((left % 86400000) / 3600000);
  const mins = left === null ? 0 : Math.floor((left % 3600000) / 60000);

  const headline = exam
    ? translate(promoActive ? `Preparing for ${exam}? Get PRO FREE` : `Preparing for ${exam}? Start free`)
    : translate(promoActive ? 'Get PRO FREE till 31 Dec 2026' : 'Sign up free and start your PRO trial');
  const meta = [
    promoActive && left ? `${translate('Ends in')} ${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m` : '',
    students >= 100 ? `${students}+ ${translate('students already joined')}` : '',
  ].filter(Boolean).join(' · ');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-16 xl:bottom-0 left-0 right-0 z-40 flex justify-center px-3 pb-2 xl:pb-4 pointer-events-none"
        >
          <div className="pointer-events-auto w-full max-w-3xl relative bg-slate-900 text-white rounded-2xl border-2 border-primary-500/40 shadow-lg flex items-center gap-3 py-3 pl-3 pr-10 sm:pl-4">
            <div className="hidden sm:flex w-10 h-10 shrink-0 rounded-xl bg-primary-500/20 border border-primary-500/30 items-center justify-center">
              <Gift className="w-5 h-5 text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-black leading-snug truncate sm:whitespace-normal">{headline}</p>
              {meta ? <p className="text-[10px] sm:text-xs font-bold text-primary-300 mt-0.5 truncate sm:whitespace-normal">{meta}</p> : null}
            </div>
            <button
              onClick={() => { trackPrompt('sticky', 'click'); googleSignup(); }}
              disabled={busy}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-black uppercase tracking-widest disabled:opacity-70"
            >
              {busy ? '...' : translate('Sign up free')}
              {!busy && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
            <button
              aria-label={translate('Close')}
              onClick={dismiss}
              className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Public (logged-out) visitors only. Renders the sticky signup bar and Google One Tap.
const SignupBoost = () => {
  const [guest, setGuest] = useState(false);
  useEffect(() => {
    try { setGuest(!localStorage.getItem('token')); } catch (e) { setGuest(false); }
  }, []);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!guest || !clientId || clientId === 'your_google_client_id_here') return null;
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Inner />
    </GoogleOAuthProvider>
  );
};

export default SignupBoost;
