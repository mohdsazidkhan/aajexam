import { getCurrentUser } from './authUtils';
import { toast } from 'react-toastify';
import config from '../config/appConfig';
import { useState, useEffect } from 'react';

/**
 * Check if user has active subscription
 * @returns {boolean}
 */
export const hasActiveSubscription = () => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return false;

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return false;

    const user = JSON.parse(userInfo);

    // Check if user has subscriptionStatus
    if (!user.subscriptionStatus) return false;

    // For free users, they have access to basic features
    if (user.subscriptionStatus === 'free') return true;

    // For paid subscriptions, check expiry
    if (user.subscriptionExpiry) {
      const now = new Date();
      const expiryDate = new Date(user.subscriptionExpiry);
      return expiryDate > now;
    }

    // Check currentSubscription object if available
    if (user.currentSubscription) {
      return user.currentSubscription.status === 'active';
    }

    return false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

/**
 * Check if user has specific subscription plan
 * @param {string} planName - Plan name to check (basic, premium, pro)
 * @returns {boolean}
 */
export const hasSubscriptionPlan = (planName) => {
  try {
    const user = getCurrentUser();
    return user?.subscription?.isActive === true &&
      user?.subscription?.planName?.toLowerCase() === planName.toLowerCase();
  } catch (error) {
    console.error('Error checking subscription plan:', error);
    return false;
  }
};

/**
 * Get user's subscription details
 * @returns {Object|null}
 */
export const getSubscriptionDetails = () => {
  try {
    const user = getCurrentUser();
    return user?.subscription || null;
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return null;
  }
};

/**
 * Check if subscription is expired
 * @returns {boolean}
 */
export const isSubscriptionExpired = () => {
  try {
    const user = getCurrentUser();
    if (!user?.subscription?.isActive) return true;

    const expiresAt = new Date(user.subscription.expiresAt);
    const now = new Date();

    return expiresAt < now;
  } catch (error) {
    console.error('Error checking subscription expiry:', error);
    return true;
  }
};

/**
 * Get days remaining in subscription
 * @returns {number}
 */
export const getDaysRemaining = () => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return 0;

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return 0;

    const user = JSON.parse(userInfo);
    if (!user.subscription || user.subscription.status !== 'active') return 0;

    const now = new Date();
    const expiryDate = new Date(user.subscription.expiryDate);
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    return Math.max(0, daysLeft);
  } catch (error) {
    console.error('Error getting days remaining:', error);
    return 0;
  }
};

/**
 * Require subscription for access
 * @param {Function} router - Next.js router function
 * @param {string} redirectTo - Where to redirect if no subscription
 * @returns {boolean} - true if has subscription, false otherwise
 */
export const requireSubscription = (router, redirectTo = '/subscription') => {
  if (!hasActiveSubscription()) {
    toast.error('This feature requires an active subscription!');
    if (router) {
      router.push(redirectTo);
    }
    return false;
  }
  return true;
};

/**
 * Require specific subscription plan
 * @param {string} planName - Required plan name
 * @param {Function} router - Next.js router function
 * @param {string} redirectTo - Where to redirect if no subscription
 * @returns {boolean} - true if has required plan, false otherwise
 */
export const requireSubscriptionPlan = (planName, router, redirectTo = '/subscription') => {
  if (!hasSubscriptionPlan(planName)) {
    toast.error(`This feature requires a ${planName} subscription!`);
    if (router) {
      router.push(redirectTo);
    }
    return false;
  }
  return true;
};

/**
 * React hook to get current theme with reactivity
 * @returns {string} 'dark' or 'light'
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && savedTheme !== theme) {
        setTheme(savedTheme);
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [theme]);

  return theme;
};

/**
 * Get current theme (dark or light)
 * @returns {string} 'dark' or 'light'
 */
export const getCurrentTheme = () => {
  try {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  } catch (error) {
    console.error('Error getting current theme:', error);
    return 'light';
  }
};

const getSubscriptionText = (subscriptionStatus) => {
  if (subscriptionStatus === "free") {
    return "FREE"
  } else if (subscriptionStatus === "pro") {
    return "PRO"
  } else {
    return "NO SUBSCRIPTION"
  }
}

/**
 * Get subscription status text with theme-aware styling
 * @param {string} theme - Optional theme override ('dark' or 'light')
 * @returns {Object} Object containing text and styling classes
 */
export const getSubscriptionStatusTextWithTheme = (subscriptionStatus = null) => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return {
        text: getSubscriptionText(subscriptionStatus),
        textColor: 'text-primary-600',
        bgColor: 'bg-primary-50',
        borderColor: 'border-primary-200',
      };
    }

    const currentTheme = getCurrentTheme();
    const userInfo = localStorage.getItem('userInfo');

    if (!userInfo) {
      return {
        text: getSubscriptionText(subscriptionStatus),
        textColor: currentTheme === 'dark' ? 'text-primary-300' : 'text-primary-600',
        bgColor: currentTheme === 'dark' ? 'bg-primary-900/30' : 'bg-primary-50',
        borderColor: currentTheme === 'dark' ? 'border-primary-700' : 'border-primary-200',
      };
    }

    const user = JSON.parse(userInfo);
    if (!user.subscription || user.subscription.status === 'free') {
      return {
        text: getSubscriptionText(subscriptionStatus),
        textColor: currentTheme === 'dark' ? 'text-primary-300' : 'text-primary-600',
        bgColor: currentTheme === 'dark' ? 'bg-primary-900/30' : 'bg-primary-50',
        borderColor: currentTheme === 'dark' ? 'border-primary-700' : 'border-primary-200',
        icon: 'ðŸ†“'
      };
    }

    if (user.subscription.status === 'active') {
      const expiryDate = new Date(user.subscription.expiryDate);
      const now = new Date();
      const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) {
        return {
          text: 'Expired',
          textColor: currentTheme === 'dark' ? 'text-red-400' : 'text-primary-600',
          bgColor: currentTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-50',
          borderColor: currentTheme === 'dark' ? 'border-red-700' : 'border-red-200',
          icon: 'â°'
        };
      }

      if (daysLeft <= 7) {
        return {
          text: `Expires in ${daysLeft} days`,
          textColor: currentTheme === 'dark' ? 'text-primary-400' : 'text-primary-600',
          bgColor: currentTheme === 'dark' ? 'bg-primary-900/30' : 'bg-primary-50',
          borderColor: currentTheme === 'dark' ? 'border-primary-700' : 'border-primary-200',
          icon: 'âš ï¸'
        };
      }

      return {
        text: 'Active',
        textColor: currentTheme === 'dark' ? 'text-green-400' : 'text-green-600',
        bgColor: currentTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-50',
        borderColor: currentTheme === 'dark' ? 'border-green-700' : 'border-green-200',
        icon: 'âœ…'
      };
    }

    const status = user.subscription.status.charAt(0).toUpperCase() + user.subscription.status.slice(1);
    return {
      text: status,
      textColor: currentTheme === 'dark' ? 'text-red-400' : 'text-primary-600',
      bgColor: currentTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-50',
      borderColor: currentTheme === 'dark' ? 'border-red-700' : 'border-red-200',
      icon: 'âŒ'
    };
  } catch (error) {
    console.error('Error getting subscription status text with theme:', error);
    return {
      text: 'Unknown',
      textColor: 'text-gray-500',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      icon: 'â“'
    };
  }
};

/**
 * Get subscription status text
 * @returns {string}
 */
export const getSubscriptionStatusText = () => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return 'No Subscription';

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return 'No Subscription';

    const user = JSON.parse(userInfo);
    if (!user.subscription) return 'No Subscription';

    if (user.subscription.status === 'active') {
      const expiryDate = new Date(user.subscription.expiryDate);
      const now = new Date();
      const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) return 'Expired';
      if (daysLeft <= 7) return `Expires in ${daysLeft} days`;
      return 'Active';
    }

    return user.subscription.status.charAt(0).toUpperCase() + user.subscription.status.slice(1);
  } catch (error) {
    console.error('Error getting subscription status text:', error);
    return 'Unknown';
  }
};

/**
 * Get subscription status color
 * @returns {string}
 */
export const getSubscriptionStatusColor = () => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return 'gray';

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return 'gray';

    const user = JSON.parse(userInfo);
    if (!user.subscription) return 'gray';

    if (user.subscription.status === 'active') {
      const expiryDate = new Date(user.subscription.expiryDate);
      const now = new Date();
      const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) return 'red';
      if (daysLeft <= 7) return 'orange';
      return 'green';
    }

    return 'red';
  } catch (error) {
    console.error('Error getting subscription status color:', error);
    return 'gray';
  }
};

/**
 * Subscription plans configuration
 */
export const SUBSCRIPTION_PLANS = {
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    price: 99,
    duration: '1 month',
    features: [
      'Access to all quizzes (Levels 0-10)',
      'Referral rewards eligibility',
      'Priority support',
      'Advanced analytics',
      'Exclusive content',
      'Custom study plans'
    ],
    maxQuizzes: -1 // unlimited
  }
};

/**
 * Check if user can access feature based on subscription
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export const canAccessFeature = (feature) => {
  const user = getCurrentUser();
  const subscription = user?.subscription;

  if (!subscription?.isActive) return false;

  switch (feature) {
    case 'basic_quizzes':
      return true; // All users can access basic quizzes
    case 'premium_quizzes':
      return ['premium', 'pro'].includes(subscription.planName?.toLowerCase());
    case 'pro_features':
      return subscription.planName?.toLowerCase() === 'pro';
    case 'unlimited_quizzes':
      return ['premium', 'pro'].includes(subscription.planName?.toLowerCase());
    case 'advanced_analytics':
      return ['premium', 'pro'].includes(subscription.planName?.toLowerCase());
    case 'priority_support':
      return ['premium', 'pro'].includes(subscription.planName?.toLowerCase());
    default:
      return false;
  }
};

/**
 * Get subscription plan details
 * @param {string} planName - Plan name (basic, premium, family)
 * @returns {Object|null}
 */
export const getSubscriptionPlan = (planName) => {
  return config.getSubscriptionPlan(planName);
};

/**
 * Get all subscription plans
 * @returns {Object}
 */
export const getAllSubscriptionPlans = () => {
  return config.SUBSCRIPTION_PLANS;
};

/**
 * Check if subscription is expiring soon (within 7 days)
 * @returns {boolean}
 */
export const isSubscriptionExpiringSoon = () => {
  const daysLeft = getDaysRemaining();
  return daysLeft > 0 && daysLeft <= 7;
};

/**
 * Get subscription plan name
 * @returns {string}
 */
export const getCurrentPlanName = () => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return 'No Plan';

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return 'No Plan';

    const user = JSON.parse(userInfo);
    if (!user.subscription) return 'No Plan';

    return user.subscription.planName || 'Unknown Plan';
  } catch (error) {
    console.error('Error getting current plan name:', error);
    return 'Unknown Plan';
  }
};

/**
 * Check if user can access premium features
 * @returns {boolean}
 */
export const canAccessPremiumFeatures = () => {
  return hasActiveSubscription();
};

/**
 * Check if user can access live quiz
 * @returns {boolean}
 */
export const canAccessLiveQuiz = () => {
  if (!config.isFeatureEnabled('LIVE_QUIZ')) return false;
  return hasActiveSubscription();
};

/**
 * Check if user can access wallet
 * @returns {boolean}
 */
export const canAccessWallet = () => {
  if (!config.isFeatureEnabled('WALLET')) return false;
  return hasActiveSubscription();
};

/**
 * Get subscription expiry date
 * @returns {Date|null}
 */
export const getSubscriptionExpiryDate = () => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return null;

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return null;

    const user = JSON.parse(userInfo);
    if (!user.subscription) return null;

    return new Date(user.subscription.expiryDate);
  } catch (error) {
    console.error('Error getting subscription expiry date:', error);
    return null;
  }
};

/**
 * Format subscription expiry date
 * @returns {string}
 */
export const getFormattedExpiryDate = () => {
  const expiryDate = getSubscriptionExpiryDate();
  if (!expiryDate) return 'No subscription';

  return expiryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if subscription feature is enabled
 * @returns {boolean}
 */
export const isSubscriptionEnabled = () => {
  return config.isFeatureEnabled('SUBSCRIPTION');
};

