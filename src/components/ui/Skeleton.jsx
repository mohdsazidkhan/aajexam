'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

/**
 * Premium Skeleton Loader Component
 * Features a high-fidelity shimmer effect with glassmorphism support.
 */
const Skeleton = ({ 
  className = "", 
  variant = "rect", // "rect", "circle", "text", "card"
  animate = true,
  width,
  height,
  borderRadius
}) => {
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);

  const baseStyles = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : 'auto'),
    borderRadius: borderRadius || (
      variant === 'circle' ? '9999px' : 
      variant === 'card' ? '2rem' : 
      variant === 'text' ? '0.5rem' : '1rem'
    )
  };

  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear"
      }
    }
  };

  return (
    <div 
      className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 ${className}`}
      style={baseStyles}
    >
      {animate && (
        <motion.div
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent skew-x-[-20deg]"
        />
      )}
      
      {/* Decorative inner glow for premium feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/10 pointer-events-none" />
    </div>
  );
};

export default Skeleton;

