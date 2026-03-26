import React from 'react';
import config from '../lib/config/appConfig';

const RewardBadge = ({ level, status, className = '' }) => {
  const getBadgeConfig = (level, status) => {
    switch (status) {
      case 'locked':
        return {
          text: 'Reward Locked',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: '🔒'
        };
      case 'unlocked':
        return {
          text: 'Reward Unlocked',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          textColor: 'text-blue-800 dark:text-blue-300',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: '✅'
        };
      case 'claimed':
        return {
          text: 'Reward Claimed',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-800 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: '🎉'
        };
      default:
        return null;
    }
  };

  const badgeConfig = getBadgeConfig(level, status);
  if (!badgeConfig) return null;

  const getRewardAmount = (level) => {
    switch (level) {
      case 10: return 'Monthly Prize Pool (PRO users × ₹' + config.QUIZ_CONFIG.PRIZE_PER_PRO + ')';
      default: return '';
    }
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeConfig.bgColor} ${badgeConfig.textColor} ${badgeConfig.borderColor} ${className}`}>
      <span className="mr-1">{badgeConfig.icon}</span>
      <span>{badgeConfig.text}</span>
      <span className="ml-1 text-xs opacity-75">({getRewardAmount(level)})</span>
    </div>
  );
};

export default RewardBadge;

