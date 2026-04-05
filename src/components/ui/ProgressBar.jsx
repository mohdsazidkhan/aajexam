'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Activity } from 'lucide-react';

/**
 * ProgressBar - A friendly, Duolingo-inspired progress bar for tracking learning milestones.
 */
const ProgressBar = ({
  progress = 0,
  variant = 'primary', // primary, secondary, emerald, amber, rose, indigo
  height = 'md', // sm, md, lg, xl
  className = '',
  label,
  icon: Icon,
  showPercentage = true,
  animate = true
}) => {
  const variants = {
    primary: 'bg-primary-500 shadow-duo-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]',
    secondary: 'bg-primary-500 shadow-duo-secondary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]',
    emerald: 'bg-emerald-500 shadow-duo-emerald shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]',
    amber: 'bg-amber-500 shadow-duo-amber shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]',
    rose: 'bg-rose-500 shadow-duo-rose shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]',
    indigo: 'bg-indigo-500 shadow-duo-indigo shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]',
  };

  const heights = {
    sm: 'h-3 rounded-full',
    md: 'h-6 rounded-[1rem]',
    lg: 'h-10 rounded-[1.5rem]',
    xl: 'h-14 rounded-[2rem]',
  };

  const progressValue = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-end px-4">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-4 h-4 text-content-secondary" />}
            {label && <span className="text-[10px] font-black uppercase tracking-[0.3em] text-content-secondary font-outfit">{label}</span>}
          </div>
          {showPercentage && (
            <span className="text-sm font-black font-outfit uppercase tracking-tighter text-content-primary">
              {progressValue.toFixed(0)}<span className="text-[8px] ml-1 opacity-50">PERCENT</span>
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-background-surface-secondary overflow-hidden ${heights[height]} border-2 border-border-primary shadow-inner group relative`}>
        <motion.div
          initial={animate ? { width: 0 } : { width: `${progressValue}%` }}
          animate={{ width: `${progressValue}%` }}
          transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
          className={`h-full ${variants[variant]} relative rounded-inherit overflow-hidden`}
        >
          {/* Global Shimmer Utility */}
          <div className="absolute inset-0 shimmer opacity-30" />

          {/* Active Glow Pulse */}
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Subtle Decorative Grid */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[1px] h-full bg-slate-400" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;


