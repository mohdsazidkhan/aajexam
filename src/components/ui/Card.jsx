'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Card - A friendly, AajExam-inspired 3D card container for the gamified learning experience.
 */
const Card = ({
  children,
  className = '',
  padded = true,
  hoverable = false,
  onClick,
  variant = 'white', // white, glass, glass-light, glass-dark, dark, primary
  radius = '3xl', // xl, 2xl, 3xl, 4xl, 5xl
  noShadow = false,
  noBorder = false,
  depth = true,
  glow = false
}) => {
  const variants = {
    white: 'bg-background-surface text-content-primary border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-sm',
    glass: 'glass border-white/20 dark:border-slate-800/20 shadow-sm',
    'glass-light': 'glass-light border-white/10 shadow-sm',
    'glass-dark': 'glass-dark border-white/10 shadow-sm text-white',
    dark: 'bg-slate-950 border-slate-800 text-white shadow-sm',
    primary: 'bg-primary-700 border-primary-600 shadow-sm text-white',
    none: '',
  };

  const radii = {
    xl: 'rounded-lg lg:rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    '4xl': 'rounded-[2.5rem]',
    '5xl': 'rounded-[3.5rem]',
  };

  const Container = hoverable ? motion.div : 'div';
  const motionProps = hoverable ? {
    whileHover: hoverable && !onClick ? {} : hoverable ? { y: -8, scale: 1.005 } : {}
  } : {};

  return (
    <Container
      onClick={onClick}
      {...motionProps}
      className={`
        ${variants[variant]} 
        ${radii[radius]}
        ${noBorder ? 'border-none' : 'border-2'}
        ${padded ? 'p-2 lg:p-4' : ''}
        ${hoverable ? 'cursor-pointer group' : ''} 
        ${glow ? 'glow-border' : ''}
        transition-all duration-300 font-outfit relative overflow-hidden
        ${className}
      `}
    >
      {/* Premium Shimmer for Highlights */}
      {variant.includes('glass') && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      )}

      {children}
    </Container>
  );
};

export default Card;


