'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Button - A friendly, bubbly, AajExam-inspired 3D button for the gamified learning experience.
 */
const Button = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
  fullWidth = false,
  size = 'md',
  icon: Icon,
  iconPosition = 'left'
}) => {
  // Brand system: exactly two variants, everywhere.
  // primary   -> brand green bg, white text (identical in light & dark)
  // secondary -> black bg / white text in light mode, white bg / black text in dark mode
  const variants = {
    primary: 'bg-primary-700 shadow-sm border-primary-700 text-white active:bg-primary-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]',
    secondary: 'bg-black text-white border-slate-950 shadow-sm active:bg-slate-900 dark:bg-white dark:text-black dark:border-slate-200 dark:shadow-[0_4px_0_0_#cbd5e1] dark:active:bg-slate-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_0_0_rgba(0,0,0,0.08)]',
  };

  const sizes = {
    sm: 'px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em] rounded-lg lg:rounded-xl',
    md: 'px-6 py-3.5 text-sm font-black uppercase tracking-[0.08em] rounded-2xl',
    lg: 'px-8 py-5 text-sm lg:text-base font-black uppercase tracking-[0.1em] rounded-[2rem]',
    xl: 'px-10 py-6 text-base lg:text-lg font-black uppercase tracking-[0.12em] rounded-[2.5rem]',
  };

  const IconComponent = () => Icon ? (
    <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'xl' ? 'w-6 h-6' : 'w-5 h-5'} group-hover:scale-110 transition-transform`} />
  ) : null;

  return (
    <motion.button
      whileTap={disabled ? {} : { y: 2, scale: 0.98 }}
      whileHover={disabled ? {} : { y: -2 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        ${variants[variant] || variants.primary}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : 'w-fit'}
        ${disabled ? 'opacity-40 grayscale cursor-not-allowed !shadow-none !border-none' : ''}
        relative border-b-[6px] transition-all duration-150 flex items-center justify-center gap-3 active:border-b-0
        group cursor-pointer font-outfit overflow-hidden
        ${className}
      `}
    >
      {/* Premium Shimmer Overlay */}
      {!disabled && (variant === 'primary' || variant === 'secondary') && (
        <div className="absolute inset-0 bg-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
      )}

      {/* Button Content */}
      <div className="relative z-10 flex items-center justify-center gap-3 group-hover:scale-105 transition-transform duration-200">
        {iconPosition === 'left' && <IconComponent />}
        <span className="whitespace-nowrap flex items-center gap-2">{children}</span>
        {iconPosition === 'right' && <IconComponent />}
      </div>
    </motion.button>
  );
};

export default Button;


