'use client';

import React from 'react';
import { m as motion } from 'framer-motion';

/**
 * Badge - A friendly, AajExam-inspired status indicator for the gamified learning experience.
 */
const Badge = ({
  text,
  children,
  variant = 'primary', // primary, stealth
  size = 'md', // sm, md, lg
  className = '',
  icon: Icon,
  pulse = false,
  ...props
}) => {
  // Brand system: primary (green) or stealth (neutral black/white via theme tokens)
  const variants = {
    primary: 'bg-primary-600 text-on-primary border-primary-600',
    stealth: 'bg-background-surface text-content-secondary border-border-primary',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px] font-bold rounded-full',
    md: 'px-3 py-1 text-xs font-bold rounded-full',
    lg: 'px-4 py-1.5 text-sm font-bold rounded-full',
    xl: 'px-4 py-1.5 text-sm font-bold rounded-full',
  };

  return (
    <motion.span
      initial={pulse ? { scale: 1 } : {}}
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={pulse ? { duration: 2, repeat: Infinity } : {}}
      className={`
        relative inline-flex items-center justify-center gap-1.5 font-outfit border
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
        <span className="absolute inset-0 rounded-full ring-4 ring-current opacity-20 animate-ping" />
      )}
    </motion.span>
  );
};

export default Badge;


