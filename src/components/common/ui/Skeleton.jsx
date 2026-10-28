'use client';

import React from 'react';
import { m as motion } from 'framer-motion';
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
      variant === 'circle' ? 'var(--radius-sm)' : 
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
      className={`relative overflow-hidden bg-primary-500/15 dark:bg-primary-500/20 ${className}`}
      style={baseStyles}
    >
      {animate && (
        <motion.div
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-transparent skew-x-[-20deg]"
        />
      )}
    </div>
  );
};

export default Skeleton;

