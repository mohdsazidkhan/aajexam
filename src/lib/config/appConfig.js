/**
 * Application Configuration
 * All static data and configuration values from environment variables
 */

const config = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',

  // Application Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'AajExam',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Quiz Platform',
  APP_AUTHOR: process.env.NEXT_PUBLIC_APP_AUTHOR || 'AajExam TEAM',
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
  PAYU_SUCCESS_URL: process.env.NEXT_PUBLIC_PAYU_SUCCESS_URL || `${process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://aajexam.com' : 'http://localhost:3000')}/subscription/payu-success`,
  PAYU_FAILURE_URL: process.env.NEXT_PUBLIC_PAYU_FAILURE_URL || `${process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://aajexam.com' : 'http://localhost:3000')}/subscription/payu-failure`,

  // Subscription Plans
  SUBSCRIPTION_PLANS: {
    FREE: {
      name: 'Free',
      price: 0,
      duration: '1 month',
      features: [
        'Access free practice tests for all exams',
        'View exam patterns and stages',
        'Basic performance analytics',
        'Community support'
      ]
    },
    PRO: {
      name: 'Pro',
      price: parseInt(process.env.NEXT_PUBLIC_PLAN_PRICE_PRO) || 99,
      duration: '1 month',
      features: [
        'Access all free + pro practice tests',
        'Unlimited mock tests for all exam boards',
        'Detailed score analysis and reports',
        'Section-wise performance tracking',
        'Priority support',
        'Ad-free exam practice',
        'Pro badge on your profile',
        'Export your results and progress'
      ]
    }
  },

  // Rewards & Referral Configuration (quiz-specific settings removed)
  QUIZ_CONFIG: {
    TOP_PERFORMERS_USERS: parseInt(process.env.NEXT_PUBLIC_TOP_PERFORMERS_USERS) || 5,
    ADMIN_TOP_PERFORMERS_USERS: parseInt(process.env.NEXT_PUBLIC_ADMIN_TOP_PERFORMERS_USERS) || 20,
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
    WEBSITE: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://aajexam.com'
  },

  // Legal Information
  LEGAL: {
    PRIVACY_POLICY: process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || '/privacy',
    TERMS: process.env.NEXT_PUBLIC_TERMS_URL || '/terms',
    REFUND_POLICY: process.env.NEXT_PUBLIC_REFUND_POLICY_URL || '/refund',
    DISCLAIMER: process.env.NEXT_PUBLIC_DISCLAIMER_URL || '/disclaimer',
    HALAL_DISCLAIMER: process.env.NEXT_PUBLIC_HALAL_DISCLAIMER_URL || '/halal-disclaimer',
    CONTACT: process.env.NEXT_PUBLIC_CONTACT_URL || '/contact'
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

