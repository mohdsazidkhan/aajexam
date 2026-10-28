'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCcw, AlertCircle } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import API from '../../lib/api';
import useTranslate from '../../hooks/useTranslate';

/**
 * Premium Stats Status Banner
 * Transitions from a basic alert to a sleek HUD-style "System Link" status bar.
 * Designed to provide critical feedback while maintaining a high-tech/gamified aesthetic.
 */
const BackendStatusBanner = () => {
  const { translate } = useTranslate();
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
            <section className="dark:bg-slate-900/90 border border-border-primary rounded-3xl p-6 flex flex-col xl:flex-row items-center gap-8 overflow-hidden transition-all duration-500">
              {/* Background Tech Highlight */}

              {/* HUD Icon with Pulsing Effect */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-3xl bg-black/10 dark:bg-white/10 flex items-center justify-center text-content-primary border border-border-primary">
                  <WifiOff className="w-8 h-8" />
                </div>
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [1, 0, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full border border-white dark:border-slate-900"
                />
              </div>

              {/* Information Block */}
              <div className="flex-1 text-center xl:text-left space-y-2">
                <h3 className="text-base font-bold font-outfit uppercase tracking-tight text-content-primary flex items-center justify-center xl:justify-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-content-primary" />
                  {translate('Station Uplink Interrupted')}
                </h3>
                <p className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] leading-relaxed">
                  {translate('REAL-TIME DATA SYNC IS OFFLINE.')}<br /> {translate('Restore link to resume operations.')}
                </p>
              </div>

              {/* Action Button (AajExam 3D Style) */}
              <motion.button
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ y: 0, scale: 0.95 }}
                onClick={checkBackendStatus}
                disabled={isRefreshing}
                className="flex-shrink-0 px-8 py-4 bg-primary-600 text-on-primary rounded-2xl border-primary-600 font-bold text-xs uppercase tracking-[0.08em] flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? translate('LINKING...') : translate('RE-LINK')}
              </motion.button>
            </section>

            {/* Subtle Bottom Glow Line */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-transparent blur-sm opacity-50" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackendStatusBanner;

