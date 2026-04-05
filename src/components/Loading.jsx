'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium Gamified Loading Component
 * Features HUD-style animations, glassmorphism, and Duolingo-inspired aesthetics.
 * 
 * @param {Object} props
 * @param {string} props.size - Size: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.message - Loading message (default: 'Loading...')
 * @param {string} props.color - Color: 'primary', 'secondary', 'accent', 'gray' (default: 'primary')
 * @param {boolean} props.fullScreen - Full screen mode with backdrop blur (default: false)
 */
const Loading = ({
  size = 'md',
  message = 'Loading...',
  color = 'primary',
  fullScreen = false,
}) => {
  const sizeMap = {
    sm: { container: 'w-12 h-12', ring: 'w-8 h-8', dot: 'w-2 h-2', text: 'text-[8px]', mt: 'mt-2' },
    md: { container: 'w-24 h-24', ring: 'w-16 h-16', dot: 'w-4 h-4', text: 'text-[10px]', mt: 'mt-4' },
    lg: { container: 'w-40 h-40', ring: 'w-28 h-28', dot: 'w-8 h-8', text: 'text-xs', mt: 'mt-6' },
  };

  const colorMap = {
    primary: 'from-primary-400 to-primary-600 shadow-primary-500/20',
    secondary: 'from-primary-400 to-primary-600 shadow-primary-500/20',
    accent: 'from-accent-purple to-accent-red shadow-accent-purple/20',
    gray: 'from-slate-400 to-slate-600 shadow-slate-500/20',
  };

  const selectedSize = sizeMap[size] || sizeMap.md;
  const selectedColor = colorMap[color] || colorMap.primary;

  const wrapperClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-md z-[100]'
    : 'flex items-center justify-center py-8';

  return (
    <div className={wrapperClasses}>
      <div className={`relative flex flex-col items-center justify-center ${selectedSize.container}`}>
        {/* Outer Rotating Ring (Dashed) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className={`absolute ${selectedSize.ring} rounded-full border-2 border-dashed border-slate-200 dark:border-slate-800`}
        />

        {/* Pulsing HUD Aura */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute ${selectedSize.ring} rounded-full bg-gradient-to-br ${selectedColor} blur-xl`}
        />

        {/* Center Glowing Core */}
        <motion.div
          animate={{
            scale: [0.8, 1.1, 0.8],
            boxShadow: [
              "0 0 0px var(--tw-shadow-color)",
              "0 0 20px var(--tw-shadow-color)",
              "0 0 0px var(--tw-shadow-color)"
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`relative ${selectedSize.dot} rounded-full bg-gradient-to-br ${selectedColor} z-10 shadow-lg`}
        />

        {/* Loading Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute top-full ${selectedSize.mt} text-center`}
          >
            <p className={`${selectedSize.text} font-black text-slate-700 dark:text-slate-400 uppercase tracking-[0.4em] font-outfit animate-pulse`}>
              {message}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Loading;


