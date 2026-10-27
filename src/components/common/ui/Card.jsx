'use client';

import React from 'react';
import { m as motion } from 'framer-motion';

/**
 * Card - A friendly, AajExam-inspired 3D card container for the gamified learning experience.
 */
const Card = ({
  children,
  className = '',
  padded = true,
  hoverable = false,
  onClick,
  variant = 'white', // white, dark, primary
  radius = '3xl', // xl, 2xl, 3xl, 4xl, 5xl
  noShadow = false,
  noBorder = false,
  depth = true,
  as = 'div' // semantic element: div, section, article, aside
}) => {
  const variants = {
    white: 'bg-background-surface text-content-primary border-border-primary',
 dark: 'bg-slate-950 border-slate-800 text-white shadow-sm',
    primary: 'bg-primary-600 border-primary-600 shadow-sm text-on-primary',
    none: '',
  };

  const radii = {
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-2xl',
    '4xl': 'rounded-3xl',
    '5xl': 'rounded-3xl',
  };

  const Container = hoverable ? (motion[as] || motion.div) : as;
  const motionProps = hoverable ? {
    whileHover: hoverable && !onClick ? {} : hoverable ? { y: -3 } : {}
  } : {};

  return (
    <Container
      onClick={onClick}
      {...motionProps}
      className={`
        ${variants[variant]} 
        ${radii[radius]}
        ${noBorder ? 'border-none' : 'border'}
        ${padded ? 'p-2 xl:p-4' : ''}
        ${hoverable ? 'cursor-pointer group' : ''} 
        transition-all duration-300 font-outfit relative overflow-hidden
        ${className}
      `}
    >
      {children}
    </Container>
  );
};

export default Card;


