'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Badge - A friendly, Duolingo-inspired status indicator for the gamified learning experience.
 */
const Badge = ({
  text,
  children,
  variant = 'primary', // primary, secondary, emerald, amber, rose, indigo, stealth
  size = 'md', // sm, md, lg
  className = '',
  icon: Icon,
  pulse = false,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-500 text-white shadow-duo-primary border-primary-600',
    secondary: 'bg-primary-500 text-white shadow-duo-secondary border-primary-600',
    emerald: 'bg-emerald-500 text-white shadow-duo-emerald border-emerald-600',
    amber: 'bg-amber-500 text-white shadow-duo-amber border-amber-600',
    rose: 'bg-rose-500 text-white shadow-duo-rose border-rose-600',
    indigo: 'bg-indigo-500 text-white shadow-duo-indigo border-indigo-600',
    stealth: 'bg-background-surface-secondary text-content-secondary border-border-primary shadow-sm',
    glass: 'bg-white/20 backdrop-blur-xl text-white border-white/30 shadow-xl',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border-b-2',
    lg: 'px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl border-b-[3px]',
    lg: 'px-6 py-2 text-xs font-black uppercase tracking-[0.4em] rounded-2xl border-b-4',
  };

  return (
    <motion.span
      initial={pulse ? { scale: 1 } : {}}
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={pulse ? { duration: 2, repeat: Infinity } : {}}
      className={`
        inline-flex items-center justify-center gap-2 font-outfit border-2
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${variant !== 'stealth' ? 'fill-current' : ''}`} />}
      <span className="relative z-10">{text || children}</span>

      {/* Active Pulse Ring */}
      {pulse && (
        <span className="absolute inset-0 rounded-inherit ring-4 ring-current opacity-20 animate-ping" />
      )}
    </motion.span>
  );
};

export default Badge;


