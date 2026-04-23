import React from 'react';
import { Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const ProBadge = ({ className = '', size = 'md' }) => {
  const sizes = {
    xs: 'text-[8px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center font-black tracking-widest uppercase
        bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600
        text-white rounded-full shadow-[0_2px_10px_rgba(245,158,11,0.3)]
        border border-amber-300/30
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
