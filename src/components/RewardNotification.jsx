import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export const showMonthlyRewardNotification = (rank, amount) => {
  const messages = {
    1: `🥇 Congratulations! You're #1 this month! You've won ₹${amount.toLocaleString()} (1st Place Prize)`,
    2: `🥈 Great job! You're #2 this month! You've won ₹${amount.toLocaleString()} (2nd Place Prize)`,
    3: `🥉 Well done! You're #3 this month! You've won ₹${amount.toLocaleString()} (3rd Place Prize)`
  };

  toast.success(messages[rank] || 'Monthly reward earned!', {
    duration: 6000,
    position: 'top-center',
    style: {
      background: '#10B981',
      color: '#fff',
      fontSize: '14px',
      padding: '16px',
      borderRadius: '8px',
      maxWidth: '400px'
    }
  });
};

export const showRewardUnlockedNotification = (totalAmount) => {
  toast.success(`🎊 Monthly reward unlocked! You can now claim ₹${totalAmount.toLocaleString()}.`, {
    duration: 8000,
    position: 'top-center',
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontSize: '14px',
      padding: '16px',
      borderRadius: '8px',
      maxWidth: '400px'
    }
  });
};

export const showQuizProgressNotification = (current, required) => {
  const percentage = Math.round((current / required) * 100);
  
  if (percentage >= 100) {
    toast.success('🎯 Monthly target achieved! You qualify for monthly rewards.', {
      duration: 6000,
      position: 'top-center',
      style: {
        background: '#10B981',
        color: '#fff',
        fontSize: '14px',
        padding: '16px',
        borderRadius: '8px',
        maxWidth: '400px'
      }
    });
  } else if (percentage >= 75) {
    toast(`📚 Almost there! ${current}/${required} monthly wins completed. Keep going!`, {
      duration: 4000,
      position: 'top-center'
    });
  } else if (percentage >= 50) {
    toast(`📖 Halfway there! ${current}/${required} monthly wins completed.`, {
      duration: 4000,
      position: 'top-center'
    });
  }
};

export const showRewardClaimedNotification = (amount) => {
  toast.success(`💰 Monthly reward claimed! ₹${amount.toLocaleString()} added to your balance.`, {
    duration: 5000,
    position: 'top-center',
    style: {
      background: '#10B981',
      color: '#fff',
      fontSize: '14px',
      padding: '16px',
      borderRadius: '8px',
      maxWidth: '400px'
    }
  });
};

const RewardNotification = ({ type, level, amount, current, required }) => {
  useEffect(() => {
    switch (type) {
      case 'monthly':
        showMonthlyRewardNotification(level, amount);
        break;
      case 'unlocked':
        showRewardUnlockedNotification(amount);
        break;
      case 'claimed':
        showRewardClaimedNotification(amount);
        break;
      case 'progress':
        showQuizProgressNotification(current, required);
        break;
      default:
        break;
    }
  }, [type, level, amount, current, required]);

  return null; // This component doesn't render anything
};

export default RewardNotification;
