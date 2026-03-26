import { getCurrentUser } from './authUtils';

// Subscription plan constants
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro'
};

// Plan features and limits
export const PLAN_FEATURES = {
  [SUBSCRIPTION_PLANS.FREE]: {
    name: 'Free',
    maxQuizzesPerDay: 5,
    maxLevel: 9,
    hasRewards: false,
    hasAnalytics: false,
    price: 0
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    name: 'Pro',
    maxQuizzesPerDay: -1, // Unlimited
    maxLevel: 10, // Max Level
    hasRewards: true,
    hasAnalytics: true,
    price: 99
  }
};

// Check if user has active subscription
export const hasActiveSubscription = () => {
  const user = getCurrentUser();
  if (!user || !user.subscription) return false;

  const now = new Date();
  const subscriptionEnd = new Date(user.subscription.endDate);

  return subscriptionEnd > now && user.subscription.status === 'active';
};

// Check if user has specific subscription plan
export const hasSubscriptionPlan = (requiredPlan) => {
  const user = getCurrentUser();
  if (!user || !user.subscription) return requiredPlan === SUBSCRIPTION_PLANS.FREE;

  if (!hasActiveSubscription()) return requiredPlan === SUBSCRIPTION_PLANS.FREE;

  const currentPlan = user.subscription.plan;

  // Plan hierarchy: free < basic < premium < pro
  const planHierarchy = {
    [SUBSCRIPTION_PLANS.FREE]: 0,
    [SUBSCRIPTION_PLANS.PRO]: 1
  };

  const currentLevel = planHierarchy[currentPlan] || 0;
  const requiredLevel = planHierarchy[requiredPlan] || 0;

  return currentLevel >= requiredLevel;
};

// Get user's current subscription plan
export const getCurrentSubscriptionPlan = () => {
  const user = getCurrentUser();
  if (!user || !user.subscription || !hasActiveSubscription()) {
    return SUBSCRIPTION_PLANS.FREE;
  }

  return user.subscription.plan;
};

// Get subscription status with theme colors
export const getSubscriptionStatusTextWithTheme = () => {
  const user = getCurrentUser();

  if (!user || !user.subscription) {
    return {
      text: 'Free Plan',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-700'
    };
  }

  if (!hasActiveSubscription()) {
    return {
      text: 'Expired',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    };
  }

  const plan = user.subscription.plan;
  const planInfo = PLAN_FEATURES[plan];

  return {
    text: `${planInfo.name} Plan`,
    color: plan === SUBSCRIPTION_PLANS.PRO ? 'text-orange-700 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400',
    bgColor: plan === SUBSCRIPTION_PLANS.PRO ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-gray-100 dark:bg-gray-700'
  };
};

// Check if user can access level
export const canAccessLevel = (level) => {
  const currentPlan = getCurrentSubscriptionPlan();
  const planFeatures = PLAN_FEATURES[currentPlan];

  if (planFeatures.maxLevel === -1) return true; // Unlimited

  return level <= planFeatures.maxLevel;
};

// Check if user can take more quizzes today
export const canTakeQuiz = () => {
  const currentPlan = getCurrentSubscriptionPlan();
  const planFeatures = PLAN_FEATURES[currentPlan];

  if (planFeatures.maxQuizzesPerDay === -1) return true; // Unlimited

  // This would need to be implemented with actual quiz count tracking
  // For now, we'll assume they can take quizzes
  return true;
};

// Get remaining quizzes for today
export const getRemainingQuizzes = () => {
  const currentPlan = getCurrentSubscriptionPlan();
  const planFeatures = PLAN_FEATURES[currentPlan];

  if (planFeatures.maxQuizzesPerDay === -1) return 'Unlimited';

  // This would need actual implementation with quiz tracking
  const takenToday = 0; // Placeholder
  const remaining = planFeatures.maxQuizzesPerDay - takenToday;

  return Math.max(0, remaining);
};

// Get subscription expiry date
export const getSubscriptionExpiryDate = () => {
  const user = getCurrentUser();
  if (!user || !user.subscription) return null;

  return new Date(user.subscription.endDate);
};

// Get days until subscription expires
export const getDaysUntilExpiry = () => {
  const expiryDate = getSubscriptionExpiryDate();
  if (!expiryDate) return null;

  const now = new Date();
  const diffTime = expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

// Check if subscription is expiring soon (within 7 days)
export const isSubscriptionExpiringSoon = () => {
  const daysUntilExpiry = getDaysUntilExpiry();
  return daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

// Get upgrade recommendation
export const getUpgradeRecommendation = () => {
  const currentPlan = getCurrentSubscriptionPlan();

  if (currentPlan === SUBSCRIPTION_PLANS.FREE) {
    return {
      recommended: SUBSCRIPTION_PLANS.PRO,
      reason: 'Unlimited access to all features and rewards',
      benefits: ['Unlimited quizzes', 'All levels unlocked', 'Monthly Rewards', 'Priority support']
    };
  }

  return null; // Already on highest plan
};
