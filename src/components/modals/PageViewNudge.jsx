'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';

const NudgeInner = ({ onClose }) => {
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
          toast.success('Welcome to AajExam! 🎉 Progress saved.');
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
    <motion.div
      initial={{ y: 150, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 150, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-0 sm:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto w-full max-w-4xl relative bg-slate-900 text-white sm:rounded-3xl shadow-2xl shadow-primary-500/20 border-t sm:border-2 border-primary-500/30 overflow-hidden flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-5 pr-12 md:pr-14">
        {/* background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* close button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 md:top-1/2 md:-translate-y-1/2 md:right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition z-10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex-1 flex items-start sm:items-center gap-4">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border border-primary-500/30">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
           </div>
           <div>
              <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary-400 mb-0.5">
                 You're on fire! 🔥
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-snug">
                 You're studying hard! Create a free account now to save your progress and get personalized tests.
              </p>
           </div>
        </div>
        
        {/* CTA */}
        <button
           onClick={() => googleSignup()}
           disabled={isGoogleLoading}
           className="w-full md:w-auto shrink-0 px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg border-b-4 border-primary-700 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-70 flex items-center justify-center gap-2 z-10"
        >
           {isGoogleLoading ? (
               <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
           ) : 'Save Progress Free'}
           {!isGoogleLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
};

const PageViewNudge = () => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // default true to prevent flash

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) return; // Authenticated users don't see this
    setIsAuthenticated(false);

    const handleRouteChange = () => {
      // Don't show if they already dismissed it this session
      if (sessionStorage.getItem('pageViewNudgeDismissed')) return;
      if (sessionStorage.getItem('exitIntentShown')) return; // Avoid conflicting modals

      // Increment page view count
      const currentViews = parseInt(localStorage.getItem('guestPageViews') || '0', 10);
      const newViews = currentViews + 1;
      localStorage.setItem('guestPageViews', newViews.toString());

      // Show nudge on the 3rd page view and above
      if (newViews >= 3) {
        // Small delay to let the page load first
        setTimeout(() => setShow(true), 2000);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Initial check on mount just in case they land directly and already have > 3 views
    if (!sessionStorage.getItem('pageViewNudgeDismissed') && !sessionStorage.getItem('exitIntentShown')) {
      const views = parseInt(localStorage.getItem('guestPageViews') || '0', 10);
      if (views >= 3) {
        setTimeout(() => setShow(true), 3000);
      }
    }

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('pageViewNudgeDismissed', 'true');
  };

  if (!show || isAuthenticated) return null;

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!googleClientId || googleClientId === 'your_google_client_id_here') {
    return (
      <AnimatePresence>
        <NudgeInner onClose={handleClose} />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <GoogleOAuthProvider clientId={googleClientId}>
        <NudgeInner onClose={handleClose} />
      </GoogleOAuthProvider>
    </AnimatePresence>
  );
};

export default PageViewNudge;
