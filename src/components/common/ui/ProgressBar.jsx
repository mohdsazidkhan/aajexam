'use client';

import React from 'react';
import { m as motion } from 'framer-motion';
import useTranslate from '../../../hooks/useTranslate';

const PercentLabel = () => {
  const { translate } = useTranslate();
  return <span className="text-[8px] ml-1 opacity-50">{translate('PERCENT')}</span>;
};

/**
 * ProgressBar - A friendly, AajExam-inspired progress bar for tracking learning milestones.
 */
const ProgressBar = ({
  progress = 0,
  variant = 'primary', // primary only (brand green)
  height = 'md', // sm, md, lg, xl, or a raw Tailwind height class (e.g. "h-2")
  className = '',
  label,
  icon: Icon,
  showPercentage = true,
  animate = true
}) => {
  const variants = {
    primary: 'bg-primary-600',
  };

  const heights = {
    sm: 'h-2 rounded-full',
    md: 'h-3 rounded-full',
    lg: 'h-5 rounded-full',
    xl: 'h-7 rounded-full',
  };

  const progressValue = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full space-y-2 xl:space-y-4 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-4 h-4 text-content-secondary" />}
            {label && <span className="text-xs font-bold uppercase tracking-[0.08em] text-content-secondary font-outfit">{label}</span>}
          </div>
          {showPercentage && (
            <span className="text-sm font-bold font-outfit text-content-primary">
              {progressValue.toFixed(0)}<PercentLabel />
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-background-surface-secondary overflow-hidden ${heights[height] || `${height} rounded-full`} group relative`}>
        <motion.div
          initial={animate ? { width: 0 } : { width: `${progressValue}%` }}
          animate={{ width: `${progressValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${variants[variant] || variants.primary} rounded-full`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;


