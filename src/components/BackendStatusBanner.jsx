'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCcw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../lib/api';

/**
 * Premium Stats Status Banner
 * Transitions from a basic alert to a sleek HUD-style "System Link" status bar.
 * Designed to provide critical feedback while maintaining a high-tech/gamified aesthetic.
 */
const BackendStatusBanner = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [showBanner, setShowBanner] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    setIsRefreshing(true);
    try {
      // Small delay for dramatic effect in HUD
      await new Promise(r => setTimeout(r, 800));
      await API.request('/api/public/health');
      setStatus('online');
      setShowBanner(false);
    } catch (error) {
      setStatus('offline');
      setShowBanner(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.95 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-xl"
        >
          <div className="relative group">
            {/* Glassmorphism Container */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-4 border-rose-500/30 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(244,63,94,0.2)] flex flex-col lg:flex-row items-center gap-8 overflow-hidden transition-all duration-500">
              {/* Background Tech Highlight */}
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* HUD Icon with Pulsing Effect */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-[2rem] bg-rose-500/10 flex items-center justify-center text-rose-500 border-2 border-rose-500/20 shadow-inner">
                  <WifiOff className="w-8 h-8" />
                </div>
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [1, 0, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-4 border-white dark:border-slate-900 shadow-sm"
                />
              </div>

              {/* Information Block */}
              <div className="flex-1 text-center lg:text-left space-y-2">
                <h3 className="text-base font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white flex items-center justify-center lg:justify-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  Station Uplink Interrupted
                </h3>
                <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
                  REAL-TIME DATA SYNC IS OFFLINE.<br /> Restore link to resume operations.
                </p>
              </div>

              {/* Action Button (Duolingo 3D Style) */}
              <motion.button
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ y: 0, scale: 0.95 }}
                onClick={checkBackendStatus}
                disabled={isRefreshing}
                className="flex-shrink-0 px-8 py-4 bg-rose-500 text-white rounded-2xl border-b-[6px] border-rose-700 shadow-duo-red font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'LINKING...' : 'RE-LINK'}
              </motion.button>
            </div>

            {/* Subtle Bottom Glow Line */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent blur-sm opacity-50" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackendStatusBanner;

