'use client';

import React from 'react';
import { RefreshCcw, Home, Terminal, ShieldAlert, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Premium Critical Failure (ErrorBoundary) Component
 * Designed as a "System Breakdown" experience with high-quality HUD elements, 
 * glassmorphism, and Duolingo-inspired 3D buttons.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // In a real app, you could log this Stats to a remote server
    console.error('SYSTEM_BREACH_LOG:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0c1317] p-6 selection:bg-rose-500 selection:text-white transition-colors duration-500">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-xl w-full"
          >
            {/* Dynamic HUD Header */}
            <div className="relative mb-12 text-center">
              <motion.div
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-24 lg:w-48 h-24 lg:h-48 bg-rose-500/10 blur-[90px] rounded-full pointer-events-none"
              />

              <div className="relative inline-flex items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-[3.5rem] border-4 border-rose-500/20 shadow-2xl mb-10 group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <ShieldAlert className="w-16 h-16 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse" />
              </div>

              <h1 className="text-5xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white mb-4 drop-shadow-sm">
                Critical Breach
              </h1>
              <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] leading-relaxed">
                SYSTEM FAILURE DETECTED. <br /> OPERATIONS STABILITY COMPROMISED.
              </p>
            </div>

            {/* Action Console Area */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-slate-100 dark:border-slate-800 p-10 shadow-2xl space-y-8 relative overflow-hidden">
              {/* Secondary Decorative Glow */}
              <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-primary-500/5 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                <motion.button
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ y: 0, scale: 0.98 }}
                  onClick={() => window.location.reload()}
                  className="flex-1 px-8 py-5 bg-rose-500 text-white rounded-3xl border-b-[8px] border-rose-700 shadow-duo-red font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300"
                >
                  <RefreshCcw className="w-5 h-5" /> REBOOT OPS
                </motion.button>

                <motion.button
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ y: 0, scale: 0.98 }}
                  onClick={() => window.location.href = '/'}
                  className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 dark:text-slate-300 rounded-3xl border-b-[8px] border-slate-200 dark:border-slate-700 shadow-sm font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white dark:hover:bg-slate-750"
                >
                  <Home className="w-5 h-5" /> ABORT MISSION
                </motion.button>
              </div>

              {/* Secure Log Display for Development */}
              {process.env.NODE_ENV === 'development' && (
                <details className="group border-2 border-slate-50 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300">
                  <summary className="cursor-pointer px-8 py-5 bg-slate-50/50 dark:bg-slate-800/40 text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-3.5 h-3.5" /> DECRYPTION LOGS
                    </div>
                    <div className="w-4 h-4 group-open:rotate-180 transition-transform duration-300">
                      <RefreshCcw className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  </summary>
                  <div className="p-8 bg-slate-950 text-emerald-400 font-mono text-[10px] whitespace-pre-wrap overflow-auto max-h-[350px] leading-relaxed border-t-2 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4 text-rose-400 border-b border-rose-900/30 pb-2">
                      <AlertCircle className="w-4 h-4" /> <span>ERROR_ORIGIN_Stats</span>
                    </div>
                    <span className="text-rose-400/80"># FAULT_TYPE:</span> {this.state.error?.toString()}
                    <br /><br />
                    <span className="text-rose-400/80"># COMPONENT_STACK:</span>
                    <br />
                    <div className="mt-2 text-slate-600 dark:text-slate-400/80">
                      {this.state.errorInfo?.componentStack}
                    </div>
                  </div>
                </details>
              )}
            </div>

            {/* Bottom Metadata */}
            <div className="mt-12 text-center relative z-10">
              <p className="text-[9px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.5em] mix-blend-difference">
                CORE_REF: {new Date().getTime().toString(16).toUpperCase()} // AAJ_SECURE_PROTO
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

