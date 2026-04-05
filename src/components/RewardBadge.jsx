import React from 'react';
import { Lock, Sparkles, PartyPopper, IndianRupee } from 'lucide-react';
import config from '../lib/config/appConfig';

const RewardBadge = ({ level, status, className = '' }) => {
  const getBadgeConfig = (level, status) => {
    switch (status) {
      case 'locked':
        return {
          text: 'Locked',
          bgColor: 'bg-slate-100 dark:bg-slate-700',
          textColor: 'text-slate-600 dark:text-slate-400',
          borderColor: 'border-slate-200 dark:border-slate-600',
          icon: Lock
        };
      case 'unlocked':
        return {
          text: 'Unlocked',
          bgColor: 'bg-primary-500',
          textColor: 'text-white',
          borderColor: 'border-white/20',
          icon: Sparkles
        };
      case 'claimed':
        return {
          text: 'Claimed',
          bgColor: 'bg-primary-500',
          textColor: 'text-white',
          borderColor: 'border-white/20',
          icon: PartyPopper
        };
      default:
        return null;
    }
  };

  const badgeConfig = getBadgeConfig(level, status);
  if (!badgeConfig) return null;
  const Icon = badgeConfig.icon;

  const getRewardAmount = (level) => {
    switch (level) {
      case 10: return `Monthly Prize Pool (PRO users Ã— ₹${config.QUIZ_CONFIG.PRIZE_PER_PRO})`;
      default: return '';
    }
  };

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-b-4 shadow-xl font-outfit ${badgeConfig.bgColor} ${badgeConfig.textColor} ${badgeConfig.borderColor} ${className}`}>
      <Icon className="mr-2 w-3.5 h-3.5" />
      <span>{badgeConfig.text}</span>
      {getRewardAmount(level) && (
        <span className="ml-2 text-[8px] opacity-70">({getRewardAmount(level)})</span>
      )}
    </div>
  );
};

export default RewardBadge;



