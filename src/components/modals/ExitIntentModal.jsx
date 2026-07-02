'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Gift, X, BookOpen, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';

const ExitIntentModalInner = ({ onClose }) => {
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
          toast.success('Welcome to AajExam! 🎉 Your free mock test is unlocked.');
          onClose();
          router.push(authRes.user.role === 'admin' ? '/admin/dashboard' : '/home');
        }
      } catch (error) {
        toast.error('Google sign-up failed. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error('Google sign-up was cancelled.');
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
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border-2 border-primary-500/20 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white dark:border-slate-800">
              <Gift className="w-10 h-10 text-primary-600" />
            </div>

            <h2 className="text-2xl lg:text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white mb-2">
              Wait! Don't Leave Empty Handed.
            </h2>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
              Sign up in 10 seconds to unlock a <span className="text-emerald-500 font-black">Free Premium Mock Test</span> and personalized progress tracking.
            </p>

            <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0"><BookOpen className="w-4 h-4" /></div>
                Free Latest PYQ PDF & Tests
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0"><Target className="w-4 h-4" /></div>
                Personalized Weakness Analysis
              </div>
            </div>

            <button
              onClick={() => googleSignup()}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-xl disabled:opacity-70 group border-b-4 border-slate-700 dark:border-slate-300 active:border-b-0 active:translate-y-1"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {isGoogleLoading ? 'Signing in...' : 'Claim Free Account'}
            </button>
            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Takes only 10 seconds</p>
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

    const handleMouseLeave = (e) => {
      // Trigger if mouse leaves top of viewport (y <= 0)
      if (e.clientY <= 0) {
        setShow(true);
        sessionStorage.setItem('exitIntentShown', 'true');
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Small delay before arming it, so it doesn't trigger immediately on load
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
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
