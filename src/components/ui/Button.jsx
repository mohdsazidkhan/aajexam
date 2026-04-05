'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Button - A friendly, bubbly, Duolingo-inspired 3D button for the gamified learning experience.
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
  const variants = {
    primary: 'bg-primary-500 shadow-duo-primary border-primary-600 text-white active:bg-primary-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]',
    secondary: 'bg-primary-500 shadow-duo-secondary border-primary-600 text-white active:bg-primary-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]',
    emerald: 'bg-emerald-500 shadow-duo-emerald border-emerald-600 text-white active:bg-emerald-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]',
    amber: 'bg-amber-500 shadow-duo-amber border-amber-600 text-white active:bg-amber-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]',
    rose: 'bg-rose-500 shadow-duo-rose border-rose-600 text-white active:bg-rose-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]',
    ghost: 'bg-background-surface text-content-secondary border-border-primary hover:bg-background-surface-secondary !shadow-sm',
    transparent: 'bg-transparent text-content-secondary hover:bg-background-surface-secondary/50 !shadow-none !border-none',
    white: 'bg-white text-primary-600 border-b-[#E2E8F0] hover:bg-slate-50 shadow-sm',
    none: '',
  };

  const sizes = {
    sm: 'px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em] rounded-xl',
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
        ${variants[variant]} 
        ${sizes[size]}
        ${fullWidth ? 'w-full' : 'w-fit'}
        ${disabled ? 'opacity-40 grayscale cursor-not-allowed !shadow-none !border-none' : ''}
        relative border-b-[6px] transition-all duration-150 flex items-center justify-center gap-3 active:border-b-0
        group cursor-pointer font-outfit overflow-hidden
        ${className}
      `}
    >
      {/* Premium Shimmer Overlay */}
      {!disabled && (variant === 'primary' || variant === 'secondary' || variant === 'emerald') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
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


