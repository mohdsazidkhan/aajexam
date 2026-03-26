/**
 * Application Configuration
 * All static data and configuration values from environment variables
 */

const config = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',

  // Application Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SUBG QUIZ',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Quiz Platform',
  APP_AUTHOR: process.env.NEXT_PUBLIC_APP_AUTHOR || 'SUBG QUIZ TEAM',
  APP_DEVELOPER_URL: process.env.NEXT_PUBLIC_DEVELOPER_URL || 'https://mohdsazidkhan.com',

  // Security Configuration
  SECURITY_LEVEL: process.env.NEXT_PUBLIC_SECURITY_LEVEL || 'high',
  ADMIN_LOGGING: process.env.NEXT_PUBLIC_ADMIN_LOGGING === 'true',
  SESSION_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT) || 3600000, // 1 hour
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS) || 5,

  // Payment Configuration
  CURRENCY: process.env.NEXT_PUBLIC_CURRENCY || 'INR',
  PAYMENT_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_PAYMENT_TIMEOUT) || 300000, // 5 minutes

  // PayU Configuration
  PAYU_MERCHANT_KEY: process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY || 'your_payu_merchant_key',
  PAYU_MERCHANT_ID: process.env.NEXT_PUBLIC_PAYU_MERCHANT_ID || 'your_payu_merchant_id',
  PAYU_PAYMENT_URL: process.env.NEXT_PUBLIC_PAYU_PAYMENT_URL || 'https://test.payu.in/_payment',
  PAYU_SUCCESS_URL: process.env.NEXT_PUBLIC_PAYU_SUCCESS_URL || `${process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://subgquiz.com' : 'http://localhost:3000')}/subscription/payu-success`,
  PAYU_FAILURE_URL: process.env.NEXT_PUBLIC_PAYU_FAILURE_URL || `${process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://subgquiz.com' : 'http://localhost:3000')}/subscription/payu-failure`,

  // Subscription Plans
  SUBSCRIPTION_PLANS: {
    FREE: {
      name: 'Free',
      price: 0,
      duration: '1 month',
      features: [
        'Unlimited Quiz Access (Levels 0-9)',
        'Community Access',
        'Basic Analytics',
        'Email Support'
      ]
    },
    PRO: {
      name: 'Pro',
      price: parseInt(process.env.NEXT_PUBLIC_PLAN_PRICE_PRO) || 99,
      duration: '1 month',
      features: [
        'Unlock Reward Withdrawals (Earn Free, Withdraw with PRO)',
        'Unlimited Quiz Access (All Levels 0-10)',
        'Community Access',
        'Advanced Analytics',
        'Priority Support',
        'Exclusive Badges',
        'Advanced Reports',
        'Data Export',
        'All PRO Features'
      ]
    }
  },

  // Quiz Configuration
  QUIZ_CONFIG: {
    DEFAULT_TIME_LIMIT: parseInt(process.env.NEXT_PUBLIC_DEFAULT_QUIZ_TIME_LIMIT) || 5, // minutes
    MAX_QUESTIONS_PER_QUIZ: parseInt(process.env.NEXT_PUBLIC_MAX_QUESTIONS_PER_QUIZ) || 5,
    MIN_QUESTIONS_PER_QUIZ: parseInt(process.env.NEXT_PUBLIC_MIN_QUESTIONS_PER_QUIZ) || 5,
    PASSING_SCORE: parseInt(process.env.NEXT_PUBLIC_PASSING_SCORE) || 60, // percentage
    TOP_PERFORMERS_USERS: parseInt(process.env.NEXT_PUBLIC_TOP_PERFORMERS_USERS) || 5, // top users
    ADMIN_TOP_PERFORMERS_USERS: parseInt(process.env.NEXT_PUBLIC_ADMIN_TOP_PERFORMERS_USERS) || 20, // top users
    QUIZ_HIGH_SCORE_PERCENTAGE: parseInt(process.env.NEXT_PUBLIC_QUIZ_HIGH_SCORE_PERCENTAGE) || 60, // percentage — reduced from 70 to 60 for growth
    MONTHLY_MINIMUM_ACCURACY: parseInt(process.env.NEXT_PUBLIC_MONTHLY_MINIMUM_ACCURACY) || parseInt(process.env.MONTHLY_MINIMUM_ACCURACY) || 60,
    DAILY_MINIMUM_ACCURACY: parseInt(process.env.NEXT_PUBLIC_DAILY_MINIMUM_ACCURACY) || parseInt(process.env.DAILY_MINIMUM_ACCURACY) || 60,
    WEEKLY_MINIMUM_ACCURACY: parseInt(process.env.NEXT_PUBLIC_WEEKLY_MINIMUM_ACCURACY) || parseInt(process.env.WEEKLY_MINIMUM_ACCURACY) || 60,
    SHOW_RESULTS_IMMEDIATELY: process.env.NEXT_PUBLIC_SHOW_RESULTS_IMMEDIATELY === 'true',
    ALLOW_RETAKES: process.env.NEXT_PUBLIC_ALLOW_RETAKES === 'true',
    MAX_RETAKES: parseInt(process.env.NEXT_PUBLIC_MAX_RETAKES) || 1,
    LEVEL_10_QUIZ_REQUIREMENT: parseInt(process.env.NEXT_PUBLIC_LEVEL_10_QUIZ_REQUIREMENT) || 50, // Total quizzes required for Level 10
    // Lowered from 12/42/110 to 5/20/50 — removes entry barrier, drives engagement
    DAILY_REWARD_QUIZ_REQUIREMENT: parseInt(process.env.NEXT_PUBLIC_DAILY_REWARD_QUIZ_REQUIREMENT) || parseInt(process.env.MIN_DAILY_REWARD_QUIZ_REQUIREMENT) || 5,
    WEEKLY_REWARD_QUIZ_REQUIREMENT: parseInt(process.env.NEXT_PUBLIC_WEEKLY_REWARD_QUIZ_REQUIREMENT) || parseInt(process.env.MIN_WEEKLY_REWARD_QUIZ_REQUIREMENT) || 20,
    MONTHLY_REWARD_QUIZ_REQUIREMENT: parseInt(process.env.NEXT_PUBLIC_MONTHLY_REWARD_QUIZ_REQUIREMENT) || parseInt(process.env.MIN_MONTHLY_QUIZ_REQUIRED) || 50,
    MONTHLY_REWARD_PRIZE_POOL: 0, // Deprecated: prize pool is now dynamic (activeProUsers × PRIZE_PER_PRO). Use API value.
    PRIZE_PER_PRO: parseInt(process.env.NEXT_PUBLIC_PRIZE_PER_PRO) || parseInt(process.env.PRIZE_PER_PRO) || 95, // Prize amount per active PRO user for monthly pool
    DAILY_POOL_MULTIPLIER: 10,  // (activeUsers * 10) / 30
    WEEKLY_POOL_MULTIPLIER: 30, // (activeUsers * 30) / 4
    MONTHLY_POOL_MULTIPLIER: 50, // activeUsers * 50
    MONTHLY_USER_REFERRAL_REQUIRED: parseInt(process.env.NEXT_PUBLIC_MONTHLY_USER_REFERRAL_REQUIRED) || 3, // Referral rewards system only
    MINIMUM_REFERRALS_FOR_MONTHLY_REWARD: 0, // Deprecated
    DAILY_USER_LEVEL_REQUIRED: parseInt(process.env.NEXT_PUBLIC_DAILY_USER_LEVEL_REQUIRED) || parseInt(process.env.DAILY_USER_LEVEL_REQUIRED) || 0,
    WEEKLY_USER_LEVEL_REQUIRED: parseInt(process.env.NEXT_PUBLIC_WEEKLY_USER_LEVEL_REQUIRED) || parseInt(process.env.WEEKLY_USER_LEVEL_REQUIRED) || 0,
    USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD: parseInt(process.env.NEXT_PUBLIC_USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD) || parseInt(process.env.MONTHLY_USER_LEVEL_REQUIRED) || 0,
    // Winner counts: Daily=1, Weekly=3, Monthly=5
    DAILY_WINNER_COUNT: parseInt(process.env.NEXT_PUBLIC_DAILY_WINNER_COUNT) || 1,
    WEEKLY_WINNER_COUNT: parseInt(process.env.NEXT_PUBLIC_WEEKLY_WINNER_COUNT) || 3,
    MONTHLY_WINNER_COUNT: parseInt(process.env.NEXT_PUBLIC_MONTHLY_WINNER_COUNT) || 5,
    MIN_DAILY_POOL: parseInt(process.env.NEXT_PUBLIC_MIN_DAILY_POOL) || 5,
    MIN_WEEKLY_POOL: parseInt(process.env.NEXT_PUBLIC_MIN_WEEKLY_POOL) || 50,
    MIN_MONTHLY_POOL: parseInt(process.env.NEXT_PUBLIC_MIN_MONTHLY_POOL) || 650,
    TOP_PERFORMERS_USERS: parseInt(process.env.NEXT_PUBLIC_TOP_PERFORMERS_USERS) || 5, // global top-performers = monthly winners
    REFERRAL_REWARD_REGISTRATION: parseInt(process.env.NEXT_PUBLIC_REFERRAL_REWARD_REGISTRATION) || 10,
    REFERRAL_REWARD_PRO: parseInt(process.env.NEXT_PUBLIC_REFERRAL_REWARD_PRO) || 33
  },

  // UI Configuration
  UI_CONFIG: {
    DEFAULT_THEME: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'light',
    ENABLE_DARK_MODE: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
    TOAST_DURATION: parseInt(process.env.NEXT_PUBLIC_TOAST_DURATION) || 3000,
    LOADING_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_LOADING_TIMEOUT) || 10000
  },

  // Contact Information
  CONTACT: {
    EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@mohdsazidkhan.com',
    PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+91-7678131912',
    ADDRESS: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Delhi, India',
    WEBSITE: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://subgquiz.com'
  },

  // Legal Information
  LEGAL: {
    PRIVACY_POLICY: process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || '/privacy',
    TERMS: process.env.NEXT_PUBLIC_TERMS_URL || '/terms',
    REFUND_POLICY: process.env.NEXT_PUBLIC_REFUND_POLICY_URL || '/refund',
    DISCLAIMER: process.env.NEXT_PUBLIC_DISCLAIMER_URL || '/disclaimer',
    HALAL_DISCLAIMER: process.env.NEXT_PUBLIC_HALAL_DISCLAIMER_URL || '/halal-disclaimer'
  },

  // Analytics and Monitoring
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || 'GA_MEASUREMENT_ID',
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || 'your_sentry_dsn',
    MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || 'your_mixpanel_token'
  },

  // Feature Flags
  FEATURES: {
    ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    LEADERBOARD: process.env.NEXT_PUBLIC_ENABLE_LEADERBOARD === 'true',
    BADGES: process.env.NEXT_PUBLIC_ENABLE_BADGES === 'true',
    LEVELS: process.env.NEXT_PUBLIC_ENABLE_LEVELS === 'true',
    WALLET: process.env.NEXT_PUBLIC_ENABLE_WALLET === 'true',
    SUBSCRIPTIONS: process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === 'true'
  },

  // Development Configuration
  DEVELOPMENT: {
    DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
    ENABLE_MOCK_DATA: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
    MOCK_API_DELAY: parseInt(process.env.NEXT_PUBLIC_MOCK_API_DELAY) || 1000
  },

  // Performance Configuration
  PERFORMANCE: {
    CACHE_DURATION: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION) || 3600000, // 1 hour
    IMAGE_OPTIMIZATION: process.env.NEXT_PUBLIC_IMAGE_OPTIMIZATION === 'true',
    LAZY_LOADING: process.env.NEXT_PUBLIC_LAZY_LOADING === 'true',
    PRELOAD_CRITICAL_RESOURCES: process.env.NEXT_PUBLIC_PRELOAD_CRITICAL_RESOURCES === 'true'
  },
  
  // Cron Job Configuration
  CRON_CONFIG: {
    DAILY_RESET: process.env.NEXT_PUBLIC_DAILY_CRON_TIME || '22:00',
    WEEKLY_RESET: process.env.NEXT_PUBLIC_WEEKLY_CRON_TIME || 'Sunday 22:00',
    MONTHLY_RESET: 'Last Day of Month 22:00', // Usually follows daily on last day
    TIMEZONE: process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Kolkata'
  }
};

// Helper functions
export const getConfig = (key) => {
  const keys = key.split('.');
  let value = config;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }

  return value;
};

export const isFeatureEnabled = (feature) => {
  return config.FEATURES[feature] === true;
};

export const getSubscriptionPlan = (planName) => {
  return config.SUBSCRIPTION_PLANS[planName.toUpperCase()];
};

export const getContactInfo = () => {
  return config.CONTACT;
};

export const getLegalLinks = () => {
  return config.LEGAL;
};

export default config;
