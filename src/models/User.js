import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import config, { getConfig } from '../lib/config/appConfig';
import './Subscription'; // Ensure Subscription model is registered

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String },
  phone: { type: String, required: false }, // Removed unique constraint for Google users
  password: { type: String },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  badges: { type: [String], default: ['Student'] },

  // Google OAuth fields
  googleId: { type: String }, // Google OAuth ID
  profilePicture: { type: String }, // Profile picture URL from Google

  // Social media links (optional)
  socialLinks: {
    instagram: { type: String, default: null },
    facebook: { type: String, default: null },
    x: { type: String, default: null }, // Twitter/X
    youtube: { type: String, default: null }
  },

  // Username for public profile
  username: {
    type: String,
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9_]{3,20}$/ // Only alphanumeric + underscore, 3-20 chars
  },

  // Public profile settings
  isPublicProfile: { type: Boolean, default: false },
  bio: { type: String, maxlength: 200 },

  // Follow system
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },

  // Profile visibility
  profileViews: { type: Number, default: 0 },
  lastProfileView: { type: Date },

  // Referral system fields
  referralCode: { type: String, default: () => uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase() },
  referredBy: { type: String, default: null }, // referralCode of the referrer
  referralCount: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  referralRewards: [{
    type: { type: String, enum: ['registration', 'plan99'] },
    amount: { type: Number },
    date: { type: Date, default: Date.now }
  }],
  subscriptionHistory: [{
    type: { type: String, enum: ['plan99'] },
    price: { type: Number },
    purchasedAt: { type: Date, default: Date.now },
    firstTime: { type: Boolean, default: true }
  }],
  isTopPerformer: { type: Boolean, default: false },

  // Phase 3: Lifetime level — NEVER resets between competitions.
  // Computed from total all-time quiz attempts.
  // Replaces the per-period currentLevel for all permanent UI displays.
  globalLevel: { type: Number, default: 0, min: 0 },
  globalLevelName: { type: String, default: 'Starter' },

  // Subscription related fields
  currentSubscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  subscriptionExpiry: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Monthly rewards tracking
  claimableRewards: {
    type: Number,
    default: 0
  },

  // Profile completion tracking
  profileCompleted: { type: Boolean, default: false },
  profileCompletionReward: { type: Boolean, default: false }, // Track if user got reward for profile completion

  // User status management
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'banned'],
    default: 'active'
  },
  statusReason: { type: String, default: null }, // Reason for status change
  statusChangedAt: { type: Date, default: Date.now },
  statusChangedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Admin who changed status

  // Quiz creation milestone tracking
  quizMilestones: [{
    count: Number,           // 9, 49, or 99
    tier: String,            // 'pro'
    achievedAt: Date,
    extended: Boolean        // true if subscription was extended, false if new
  }],

  // AajExam Transformation Fields
  primaryTargetExam: { type: String, default: 'General' }, // e.g. SSC-CHSL, UPSC-CSE
  performanceMetrics: {
    rewardStats: {
      totalWon: { type: Number, default: 0 },
      bestRank: { type: Number, default: null },
      participationStreak: { type: Number, default: 0 }
    },
    examStats: {
      overallReadiness: { type: Number, default: 0 }, // 0-100 scale
      subjectAccuracy: {
        type: Map,
        of: Number,
        default: {} // e.g. { "Mathematics": 85, "Science": 70 }
      },
      mockTestsAttempted: { type: Number, default: 0 },
      averageMockScore: { type: Number, default: 0 }
    }
  }

}, { timestamps: true });

// Database Indexes for Performance Optimization
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ referralCode: 1 }, { unique: true });
userSchema.index({ referredBy: 1 });
userSchema.index({ subscriptionStatus: 1, subscriptionExpiry: 1 });
userSchema.index({ isTopPerformer: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Get level config from database (MANDATORY)
userSchema.statics.getLevelConfig = async function (useCache = true) {
  try {
    // Attempt to get from Level model if registered
    const LevelModel = mongoose.models.Level || (mongoose.modelNames().includes('Level') ? mongoose.model('Level') : null);

    if (LevelModel && typeof LevelModel.getLevelConfig === 'function') {
      const levelConfig = await LevelModel.getLevelConfig();
      if (levelConfig && Object.keys(levelConfig).length > 0) {
        return levelConfig;
      }
    }

    // Fallback if model not ready or no levels in DB
    console.warn('⚠️ Using static LEVEL_CONFIG fallback');
    return this.LEVEL_CONFIG;
  } catch (error) {
    console.warn('⚠️ Failed to fetch levels from database, using fallback:', error.message);
    return this.LEVEL_CONFIG;
  }
};

// Static level thresholds for synchronous lookup (Must match database!)
userSchema.statics.LEVEL_CONFIG = {
  0: { name: 'Starter', quizzesRequired: 0, description: 'Start your journey!' },
  1: { name: 'Rookie', quizzesRequired: 5, description: 'Begin your quiz journey' },
  2: { name: 'Explorer', quizzesRequired: 10, description: 'Discover new challenges' },
  3: { name: 'Thinker', quizzesRequired: 15, description: 'Develop critical thinking' },
  4: { name: 'Strategist', quizzesRequired: 20, description: 'Master quiz strategies' },
  5: { name: 'Achiever', quizzesRequired: 25, description: 'Reach new heights' },
  6: { name: 'Mastermind', quizzesRequired: 30, description: 'Become a quiz expert' },
  7: { name: 'Champion', quizzesRequired: 35, description: 'Compete with the best' },
  8: { name: 'Prodigy', quizzesRequired: 40, description: 'Show exceptional talent' },
  9: { name: 'Wizard', quizzesRequired: 45, description: 'Complex questions across categories' },
  10: { name: 'Legend', quizzesRequired: 50, description: 'Ultimate quiz mastery' }
};



// Method to update performance metrics for the AajExam "Exam Prep" track
userSchema.methods.updatePerformanceMetrics = function (quiz, scorePercentage) {
  try {
    const isHighScore = scorePercentage >= (config.QUIZ_CONFIG?.QUIZ_HIGH_SCORE_PERCENTAGE || 60);
    const subject = quiz.subject || 'General';

    // 1. Update Reward Stats
    if (isHighScore) {
      if (!this.performanceMetrics.rewardStats) {
        this.performanceMetrics.rewardStats = { totalWon: 0, participationStreak: 0 };
      }
      this.performanceMetrics.rewardStats.totalWon += 1;
    }

    // 2. Update Exam Stats
    if (!this.performanceMetrics.examStats) {
      this.performanceMetrics.examStats = { mockTestsAttempted: 0, averageMockScore: 0, overallReadiness: 0, subjectAccuracy: new Map() };
    }

    this.performanceMetrics.examStats.mockTestsAttempted += 1;

    // Running average for Mock Score
    const totalAttempts = this.performanceMetrics.examStats.mockTestsAttempted;
    const currentAvg = this.performanceMetrics.examStats.averageMockScore || 0;
    this.performanceMetrics.examStats.averageMockScore = Math.round(((currentAvg * (totalAttempts - 1)) + scorePercentage) / totalAttempts);

    // Subject-wise accuracy (standard weighted average)
    if (!this.performanceMetrics.examStats.subjectAccuracy) {
      this.performanceMetrics.examStats.subjectAccuracy = new Map();
    }

    const currentSubjectAccuracy = this.performanceMetrics.examStats.subjectAccuracy.get(subject) || 0;
    const newAccuracy = currentSubjectAccuracy === 0 ? scorePercentage : Math.round((currentSubjectAccuracy + scorePercentage) / 2);
    this.performanceMetrics.examStats.subjectAccuracy.set(subject, newAccuracy);

    // Overall Readiness calculation (Simple average of subject accuracies)
    const accuracies = Array.from(this.performanceMetrics.examStats.subjectAccuracy.values());
    const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / (accuracies.length || 1);

    this.performanceMetrics.examStats.overallReadiness = Math.round(avgAccuracy);

    return true;
  } catch (error) {
    console.error('Error updating performance metrics:', error);
    return false;
  }
};

// Method to check subscription access for levels
userSchema.methods.canAccessLevel = function (levelNumber) {
  // Admin users have access to all levels (0-10) regardless of subscription
  if (this.role === 'admin') {
    return {
      canAccess: true,
      userPlan: 'admin',
      accessibleLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      requiredPlan: 'admin'
    };
  }

  const requiredLevel = getConfig('QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD') || 0;

  // Regular users follow subscription-based access
  const subscriptionAccess = {
    'none': Array.from({ length: requiredLevel }, (_, i) => i), // 0 to requiredLevel-1
    'free': Array.from({ length: requiredLevel }, (_, i) => i),
    'pro': Array.from({ length: 11 }, (_, i) => i) // 0 to 10
  };

  const userPlan = this.subscriptionStatus || 'free';
  const accessibleLevels = subscriptionAccess[userPlan] || [0, 1, 2, 3];

  return {
    canAccess: accessibleLevels.includes(levelNumber),
    userPlan: userPlan,
    accessibleLevels: accessibleLevels,
    requiredPlan: this.getRequiredPlanForLevel(levelNumber)
  };
};

// Method to get required plan for a specific level
userSchema.methods.getRequiredPlanForLevel = function (levelNumber) {
  // Admin users don't need any specific plan - they have access to all levels
  if (this.role === 'admin') {
    return 'admin';
  }

  // Regular users follow subscription-based requirements
  const requiredLevel = getConfig('QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD') || 10;
  if (levelNumber < requiredLevel) return 'free';
  return 'pro';
};

// Method to check if user profile is complete
userSchema.methods.isProfileComplete = function () {
  return this.getProfileCompletionPercentage() === 100;
};

// Method to get profile completion percentage
userSchema.methods.getProfileCompletionPercentage = function () {
  const requiredFields = [
    { field: 'name', validator: (value) => value && value.trim() !== '' },
    { field: 'email', validator: (value) => value && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) },
    { field: 'phone', validator: (value) => value && /^[0-9]{10}$/.test(value) },
    {
      field: 'socialLinks', validator: (value) => {
        if (!value) return false;
        // Check if at least one social media link is provided
        const socialPlatforms = ['instagram', 'facebook', 'x', 'youtube'];
        return socialPlatforms.some(platform => value[platform] && value[platform].trim() !== '');
      }
    }
  ];

  let completedFields = 0;

  for (const { field, validator } of requiredFields) {
    if (validator(this[field])) {
      completedFields++;
    }
  }

  return Math.round((completedFields / requiredFields.length) * 100);
};

// Method to get profile completion details
userSchema.methods.getProfileCompletionDetails = function () {
  const fields = [
    {
      name: 'Full Name',
      field: 'name',
      completed: this.name && this.name.trim() !== '',
      value: this.name || ''
    },
    {
      name: 'Email Address',
      field: 'email',
      completed: this.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email),
      value: this.email || ''
    },
    {
      name: 'Phone Number',
      field: 'phone',
      completed: this.phone && /^[0-9]{10}$/.test(this.phone),
      value: this.phone || ''
    },
    {
      name: 'Social Media Link',
      field: 'socialLinks',
      completed: this.socialLinks && (() => {
        const socialPlatforms = ['instagram', 'facebook', 'x', 'youtube'];
        return socialPlatforms.some(platform => this.socialLinks[platform] && this.socialLinks[platform].trim() !== '');
      })(),
      value: this.socialLinks ? Object.values(this.socialLinks).filter(link => link && link.trim() !== '').join(', ') : ''
    }
  ];

  const percentage = this.getProfileCompletionPercentage();

  return {
    percentage,
    isComplete: percentage === 100,
    fields,
    completedFields: fields.filter(f => f.completed).length,
    totalFields: fields.length
  };
};

// Method to update user status
userSchema.methods.updateStatus = function (newStatus, reason = null, changedBy = null) {
  const validStatuses = ['active', 'inactive', 'suspended', 'banned'];

  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}. Valid statuses are: ${validStatuses.join(', ')}`);
  }

  const previousStatus = this.status;
  this.status = newStatus;
  this.statusReason = reason;
  this.statusChangedAt = new Date();
  this.statusChangedBy = changedBy;

  return {
    previousStatus,
    newStatus,
    reason,
    changedAt: this.statusChangedAt,
    changedBy
  };
};

// Method to check if user is active
userSchema.methods.isActive = function () {
  return this.status === 'active';
};

// Method to check if user can perform actions (active users only)
userSchema.methods.canPerformAction = function () {
  return this.status === 'active';
};

// Method to get user status info
userSchema.methods.getStatusInfo = function () {
  return {
    status: this.status,
    reason: this.statusReason,
    changedAt: this.statusChangedAt,
    changedBy: this.statusChangedBy,
    isActive: this.isActive(),
    canPerformAction: this.canPerformAction()
  };
};

// Static method to find active users only
userSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, status: 'active' });
};

// Static method to count users by status
userSchema.statics.getUserStatsByStatus = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }
    },
    {
      $sort: { status: 1 }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat.status] = stat.count;
    return acc;
  }, {});
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Hot reloading fix: ensure methods are updated on the registered model
if (User) {
  User.getLevelConfig = userSchema.statics.getLevelConfig;
  User.findActive = userSchema.statics.findActive;
  User.getUserStatsByStatus = userSchema.statics.getUserStatsByStatus;

  // Update instance methods as well
  User.prototype.canAccessLevel = userSchema.methods.canAccessLevel;
  User.prototype.getRequiredPlanForLevel = userSchema.methods.getRequiredPlanForLevel;
  User.prototype.isProfileComplete = userSchema.methods.isProfileComplete;
  User.prototype.getProfileCompletionPercentage = userSchema.methods.getProfileCompletionPercentage;
  User.prototype.getProfileCompletionDetails = userSchema.methods.getProfileCompletionDetails;
  User.prototype.updateStatus = userSchema.methods.updateStatus;
  User.prototype.isActive = userSchema.methods.isActive;
  User.prototype.canPerformAction = userSchema.methods.canPerformAction;
  User.prototype.getStatusInfo = userSchema.methods.getStatusInfo;
}

export default User;
