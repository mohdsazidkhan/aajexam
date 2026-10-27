'use client';

import React from 'react';
import { m as motion } from 'framer-motion';

const PADDING_CLASS = /^(?:[a-z0-9-]+:)*!?-?p[xytrblse]?-/;

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
  iconPosition = 'left',
  cta,
}) => {
  // Brand system: exactly two variants, everywhere.
  // primary   -> brand green bg, white text (identical in light & dark)
  // secondary -> white bg / black text with light gray border in light mode, dark bg / white border+text in dark mode (never white bg in dark mode)
  const variants = {
    primary: 'bg-primary-600 border-primary-600 text-on-primary hover:brightness-110 active:brightness-95',
    secondary: 'bg-background-surface border-border-primary text-content-primary hover:bg-background-surface-secondary active:bg-background-surface-secondary',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs font-bold rounded-lg',
    md: 'px-5 py-2.5 text-sm font-bold rounded-xl',
    lg: 'px-7 py-3 text-base font-bold rounded-xl',
    xl: 'px-8 py-3 text-sm xl:px-10 xl:py-4 xl:text-lg font-bold rounded-xl',
  };

  // One default padding per size. Padding utilities passed in className are dropped: they sat
  // on top of the size padding and, because Tailwind orders by stylesheet and not by class
  // order, either stacked unpredictably or lost, so buttons of one size looked different.
  const extraClasses = className
    .split(/\s+/)
    .filter((token) => token && !PADDING_CLASS.test(token))
    .join(' ');

  const IconComponent = () => Icon ? (
    <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'xl' ? 'w-6 h-6' : 'w-5 h-5'} group-hover:scale-110 transition-transform`} />
  ) : null;

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      data-cta={cta}
      disabled={disabled}
      className={`
        ${variants[variant] || variants.primary}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : 'w-fit'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        relative transition-all duration-150 flex items-center justify-center gap-3
        border
        group cursor-pointer font-outfit overflow-hidden
        ${extraClasses}
      `}
    >
      {/* Button Content */}
      <div className="relative z-10 flex items-center justify-center gap-3">
        {iconPosition === 'left' && <IconComponent />}
        <span className="btn-label whitespace-nowrap flex items-center gap-2">{children}</span>
        {iconPosition === 'right' && <IconComponent />}
      </div>
    </motion.button>
  );
};

export default Button;


