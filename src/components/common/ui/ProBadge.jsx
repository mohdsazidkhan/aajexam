import React from 'react';
import { Crown } from 'lucide-react';
import { m as motion } from 'framer-motion';

const ProBadge = ({ className = '', size = 'md' }) => {
  const sizes = {
    xs: 'text-[8px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    xl: 'text-xs px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center font-bold tracking-[0.08em] uppercase
        bg-primary-600 text-on-primary rounded-full
        ${sizes[size]}
        ${className}
      `}
    >
      <Crown className={`${iconSizes[size]} fill-current`} />
      <span>PRO</span>
    </motion.div>
  );
};

export default ProBadge;
