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

  // Track best scores for each quiz (single attempt system)
  quizBestScores: [{
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    bestScore: { type: Number, default: 0 },
    bestScorePercentage: { type: Number, default: 0 },
    isHighScore: { type: Boolean, default: false }, // Whether best score >= threshold
    lastAttemptDate: { type: Date, default: Date.now },
    lastCompetitionType: { type: String, enum: ['daily', 'weekly', 'monthly', 'none'], default: 'none' }
  }],

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

  // Competition progress tracking
  dailyProgress: {
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) }, // YYYY-MM-DD
    highScoreWins: { type: Number, default: 0 },
    totalQuizAttempts: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    currentLevel: { type: Number, default: 0 },
    levelName: { type: String, default: 'Starter' },
    rewardEligible: { type: Boolean, default: false },
    rewardRank: { type: Number, default: null },
  },
  weeklyProgress: {
    week: {
      type: String, default: () => {
        const d = new Date();
        const year = d.getFullYear();
        const oneJan = new Date(year, 0, 1);
        const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
        return `${year}-W${week}`;
      }
    },
    highScoreWins: { type: Number, default: 0 },
    totalQuizAttempts: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    currentLevel: { type: Number, default: 0 },
    levelName: { type: String, default: 'Starter' },
    rewardEligible: { type: Boolean, default: false },
    rewardRank: { type: Number, default: null },
  },
  monthlyProgress: {
    month: { type: String, default: () => new Date().toISOString().slice(0, 7) }, // YYYY-MM
    highScoreWins: { type: Number, default: 0 },
    totalQuizAttempts: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // (wins / attempts) * 100
    totalScore: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    currentLevel: { type: Number, default: 0 },
    levelName: { type: String, default: 'Starter' },
    rewardEligible: { type: Boolean, default: false },
    rewardRank: { type: Number, default: null },
  },

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
userSchema.index({ 'dailyProgress.highScoreWins': -1, 'dailyProgress.accuracy': -1 });
userSchema.index({ 'weeklyProgress.highScoreWins': -1, 'weeklyProgress.accuracy': -1 });
userSchema.index({ 'monthlyProgress.highScoreWins': -1, 'monthlyProgress.accuracy': -1 });
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


// Monthly reward distribution (dynamic based on active PRO users)
userSchema.statics.getRewardDistribution = async function () {
  const PRIZE_PER_PRO = config.QUIZ_CONFIG.PRIZE_PER_PRO || 95;
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const activeProUsers = await this.countDocuments({
    subscriptionStatus: 'pro',
    status: 'active',
    subscriptionExpiry: { $gte: today },
    $or: [
      { 'monthlyProgress.month': `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}` },
      { subscriptionExpiry: { $gte: monthStart } }
    ]
  });
  const calculatedPool = activeProUsers * PRIZE_PER_PRO;
  const minPool = config.QUIZ_CONFIG.MIN_MONTHLY_POOL || 0;
  const totalPrizePool = Math.max(calculatedPool, minPool);

  const distribution = [
    { rank: 1, percentage: 35, amount: Math.round(totalPrizePool * 0.35) },
    { rank: 2, percentage: 25, amount: Math.round(totalPrizePool * 0.25) },
    { rank: 3, percentage: 20, amount: Math.round(totalPrizePool * 0.20) },
    { rank: 4, percentage: 12, amount: Math.round(totalPrizePool * 0.12) },
    { rank: 5, percentage: 8, amount: Math.round(totalPrizePool * 0.08) }
  ];

  return {
    distribution,
    totalPrizePool,
    activeProUsers,
    prizePerPro: PRIZE_PER_PRO
  };
};


// Helper to calculate level and levelName based on attempts
userSchema.statics.calculateLevelInfo = async function (attempts) {
  const levelConfig = await this.getLevelConfig();
  const maxLevel = Math.max(...Object.keys(levelConfig).map(Number));

  let currentLevel = 0;
  let levelName = 'Starter';

  for (let l = maxLevel; l >= 0; l--) {
    if (levelConfig[l] && attempts >= levelConfig[l].quizzesRequired) {
      currentLevel = l;
      levelName = levelConfig[l].name;
      break;
    }
  }
  return { currentLevel, levelName };
};

// Instance method to update level information for all periods
userSchema.methods.updateLevel = async function () {
  const Model = this.constructor;
  this.ensureProgress();

  // Update Daily
  const dailyInfo = await Model.calculateLevelInfo(this.dailyProgress.totalQuizAttempts);
  this.dailyProgress.currentLevel = dailyInfo.currentLevel;
  this.dailyProgress.levelName = dailyInfo.levelName;

  // Update Weekly
  const weeklyInfo = await Model.calculateLevelInfo(this.weeklyProgress.totalQuizAttempts);
  this.weeklyProgress.currentLevel = weeklyInfo.currentLevel;
  this.weeklyProgress.levelName = weeklyInfo.levelName;

  // Update Monthly
  const monthlyInfo = await Model.calculateLevelInfo(this.monthlyProgress.totalQuizAttempts);
  this.monthlyProgress.currentLevel = monthlyInfo.currentLevel;
  this.monthlyProgress.levelName = monthlyInfo.levelName;

  return {
    daily: dailyInfo,
    weekly: weeklyInfo,
    monthly: monthlyInfo
  };
};


// Ensure competition progress exists and is current; reset if period changed
userSchema.methods.ensureProgress = function () {
  const now = new Date();

  // Daily
  const currentDate = now.toISOString().slice(0, 10);
  if (!this.dailyProgress || this.dailyProgress.date !== currentDate) {
    this.dailyProgress = {
      date: currentDate,
      highScoreWins: 0,
      totalQuizAttempts: 0,
      accuracy: 0,
      totalScore: 0,
      totalCorrectAnswers: 0,
      currentLevel: 0,
      levelName: 'Starter',
      rewardEligible: false,
      rewardRank: null
    };
  }

  // Weekly (ISO week approximation)
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  const currentWeek = `${now.getFullYear()}-W${weekNum}`;
  if (!this.weeklyProgress || this.weeklyProgress.week !== currentWeek) {
    this.weeklyProgress = {
      week: currentWeek,
      highScoreWins: 0,
      totalQuizAttempts: 0,
      accuracy: 0,
      totalScore: 0,
      totalCorrectAnswers: 0,
      currentLevel: 0,
      levelName: 'Starter',
      rewardEligible: false,
      rewardRank: null
    };
  }

  // Monthly
  const currentMonth = now.toISOString().slice(0, 7);
  if (!this.monthlyProgress || this.monthlyProgress.month !== currentMonth) {
    this.monthlyProgress = {
      month: currentMonth,
      highScoreWins: 0,
      totalQuizAttempts: 0,
      accuracy: 0,
      totalScore: 0,
      totalCorrectAnswers: 0,
      currentLevel: 0,
      levelName: 'Starter',
      rewardEligible: false,
      rewardRank: null,
      rewardLocked: false
    };
  }
};

userSchema.methods.ensureMonthlyProgress = function () {
  this.ensureProgress();
};

// Method to add quiz completion
userSchema.methods.addQuizCompletion = async function (score, totalQuestions, competitionType = null) {
  // Ensure progress exists and is current
  this.ensureProgress();

  // Calculate score percentage
  const scorePercentage = (score / totalQuestions) * 100;
  const highScoreThreshold = config.QUIZ_CONFIG?.QUIZ_HIGH_SCORE_PERCENTAGE || 60;
  const isHighScore = scorePercentage >= highScoreThreshold;

  // We need the model constructor for getLevelConfig wrapper
  const Model = this.constructor;

  const updateStats = async (progress, type) => {
    progress.totalQuizAttempts += 1;
    progress.totalScore += totalQuestions;
    progress.totalCorrectAnswers += score;

    if (isHighScore) {
      progress.highScoreWins += 1;
    }
    progress.accuracy = progress.totalQuizAttempts > 0
      ? Math.round((progress.highScoreWins / progress.totalQuizAttempts) * 100)
      : 0;

    // Always update level logic since all progress objects now have levels
    const levelInfo = await Model.calculateLevelInfo(progress.totalQuizAttempts);
    progress.currentLevel = levelInfo.currentLevel;
    progress.levelName = levelInfo.levelName;

    // Eligibility checks
    if (progress === this.dailyProgress) {
      const reqQuizzes = getConfig('QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT') || 5;
      const reqLevel = getConfig('QUIZ_CONFIG.DAILY_USER_LEVEL_REQUIRED') || 0;
      const dailyMinAccuracy = getConfig('QUIZ_CONFIG.DAILY_MINIMUM_ACCURACY') || 60;
      progress.rewardEligible = progress.totalQuizAttempts >= reqQuizzes && progress.accuracy >= dailyMinAccuracy && progress.currentLevel >= reqLevel;
    } else if (progress === this.weeklyProgress) {
      const reqQuizzes = getConfig('QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT') || 20;
      const reqLevel = getConfig('QUIZ_CONFIG.WEEKLY_USER_LEVEL_REQUIRED') || 0;
      const weeklyMinAccuracy = getConfig('QUIZ_CONFIG.WEEKLY_MINIMUM_ACCURACY') || 60;
      progress.rewardEligible = progress.totalQuizAttempts >= reqQuizzes && progress.accuracy >= weeklyMinAccuracy && progress.currentLevel >= reqLevel;
    } else if (progress === this.monthlyProgress) {
      const reqQuizzes = getConfig('QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT') || 50;
      const reqLevel = getConfig('QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD') || 0;
      const monthlyMinAccuracy = getConfig('QUIZ_CONFIG.MONTHLY_MINIMUM_ACCURACY') || 60;
      progress.rewardEligible = progress.totalQuizAttempts >= reqQuizzes && progress.accuracy >= monthlyMinAccuracy && progress.currentLevel >= reqLevel;
    }
  };

  if (competitionType === 'daily') {
    await updateStats(this.dailyProgress, 'daily');
  } else if (competitionType === 'weekly') {
    await updateStats(this.weeklyProgress, 'weekly');
  } else {
    // Default fallback: only update monthly (or if competitionType is 'monthly')
    await updateStats(this.monthlyProgress, 'monthly');
  }

  return {
    scorePercentage: Math.round(scorePercentage),
    isHighScore,
    daily: { ...this.dailyProgress },
    weekly: { ...this.weeklyProgress },
    monthly: {
      highScoreWins: this.monthlyProgress.highScoreWins,
      totalQuizAttempts: this.monthlyProgress.totalQuizAttempts,
      accuracy: this.monthlyProgress.accuracy,
      currentLevel: this.monthlyProgress.currentLevel,
      levelName: this.monthlyProgress.levelName,
      rewardEligible: this.monthlyProgress.rewardEligible
    }
  };
};

// Method to get level info based on competition type
userSchema.methods.getLevelInfo = async function (competitionType = 'monthly') {
  try {
    const levelConfig = await this.constructor.getLevelConfig();

    this.ensureProgress();

    // Select the correct progress object based on competitionType
    let progress;
    if (competitionType === 'daily') {
      progress = this.dailyProgress;
    } else if (competitionType === 'weekly') {
      progress = this.weeklyProgress;
    } else {
      progress = this.monthlyProgress;
    }

    const currentLevel = progress?.currentLevel || 0;
    const maxLevel = Math.max(...Object.keys(levelConfig).map(Number));
    const nextLevel = Math.min(currentLevel + 1, maxLevel);

    return {
      currentLevel: {
        number: currentLevel,
        name: levelConfig[currentLevel]?.name || 'Unknown',
        description: levelConfig[currentLevel]?.description || '',
        quizzesRequired: levelConfig[currentLevel]?.quizzesRequired || 0
      },
      nextLevel: {
        number: nextLevel,
        name: levelConfig[nextLevel]?.name || levelConfig[currentLevel]?.name || 'Max Level',
        description: levelConfig[nextLevel]?.description || levelConfig[currentLevel]?.description || '',
        quizzesRequired: levelConfig[nextLevel]?.quizzesRequired || levelConfig[currentLevel]?.quizzesRequired || 0
      },
      progress: {
        quizzesPlayed: progress.totalQuizAttempts || 0,
        highScoreQuizzes: progress.highScoreWins || 0,
        progressPercentage: 0,
        quizzesToNextLevel: levelConfig[nextLevel]?.quizzesRequired || levelConfig[currentLevel]?.quizzesRequired || 0,
        quizzesToNextLevelRemaining: Math.max(0, (levelConfig[nextLevel]?.quizzesRequired || 0) - (progress.totalQuizAttempts || 0))
      },
      stats: {
        totalScore: progress.totalScore || 0,
        averageScore: progress.totalQuizAttempts > 0 ? Math.round(progress.totalScore / progress.totalQuizAttempts) : 0,
        lastLevelUp: new Date(),
        highScoreRate: progress.totalQuizAttempts > 0 ? Math.round((progress.highScoreWins / progress.totalQuizAttempts) * 100) : 0
      }
    };
  } catch (error) {
    console.error('Error in getLevelInfo:', error);
    throw error;
  }
};

// Quick helper to get level number and name based on competition type
userSchema.methods.getCompetitionLevel = function (competitionType = 'monthly') {
  this.ensureProgress();
  const progress = competitionType === 'daily' ? this.dailyProgress :
    (competitionType === 'weekly' ? this.weeklyProgress : this.monthlyProgress);

  return {
    currentLevel: progress?.currentLevel || 0,
    levelName: progress?.levelName || 'Starter'
  };
};


// Method to check if user can attempt a quiz (single attempt system with periodic resets)
userSchema.methods.canAttemptQuiz = async function (quizId, competitionType = 'none') {
  // Check if user is active
  if (this.status !== 'active') {
    return {
      canAttempt: false,
      reason: `User account is ${this.status}. Contact support for assistance.`
    };
  }

  // PRO is NOT required to play any competition.
  // Free users compete fully; PRO is only required for withdrawal.
  // This drives growth: users win → see prize → upgrade to claim it.
  // (No restriction block here — all users proceed to the attempt check below)

  // Get start date of the current period
  const now = new Date();
  let periodStart = new Date(0); // Default to start of time (no reset)

  // Level access check for Monthly/None modes
  if (competitionType !== 'daily' && competitionType !== 'weekly') {
    const Quiz = mongoose.models.Quiz;
    const quiz = await Quiz.findById(quizId);
    if (quiz && quiz.requiredLevel) {
      const levelAccess = this.canAccessLevel(quiz.requiredLevel);
      if (!levelAccess.canAccess) {
        return {
          canAttempt: false,
          reason: `You need a ${levelAccess.requiredPlan} plan to access Level ${quiz.requiredLevel} quizzes. Upgrade to continue your Monthly journey!`
        };
      }
    }
  }

  if (competitionType === 'daily') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (competitionType === 'weekly') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
    periodStart = new Date(now.setDate(diff));
    periodStart.setHours(0, 0, 0, 0);
  } else if (competitionType === 'monthly') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Check QuizAttempt collection for any attempt of this quiz since periodStart
  // This implicitly handles cross-mode restrictions:
  // - A 'daily' attempt Today will block 'weekly' and 'monthly' because Today is within their respective periods.
  const QuizAttempt = mongoose.models.QuizAttempt;
  const existingAttempt = QuizAttempt ? await QuizAttempt.findOne({
    user: this._id,
    quiz: quizId,
    attemptedAt: { $gte: periodStart }
  }) : null;

  if (existingAttempt) {
    const periodLabel = competitionType === 'daily' ? 'day' : (competitionType === 'weekly' ? 'week' : (competitionType === 'monthly' ? 'month' : ''));
    return {
      canAttempt: false,
      attemptsLeft: 0,
      attemptNumber: 1,
      bestScore: existingAttempt.scorePercentage,
      isHighScore: existingAttempt.scorePercentage >= (config.QUIZ_CONFIG?.QUIZ_HIGH_SCORE_PERCENTAGE || 60),
      reason: periodLabel ? `Quiz already attempted this ${periodLabel}` : 'Quiz already attempted'
    };
  }

  // User has not attempted this quiz in this period
  return { canAttempt: true, attemptsLeft: 1, attemptNumber: 1, bestScore: null };
};

// Method to update quiz best score after attempt
userSchema.methods.updateQuizBestScore = function (quizId, score, totalQuestions, competitionType = 'none') {
  const scorePercentage = Math.round((score / totalQuestions) * 100);
  const highScoreThreshold = config.QUIZ_CONFIG?.QUIZ_HIGH_SCORE_PERCENTAGE || 60;
  const isHighScore = scorePercentage >= highScoreThreshold;

  let existingQuizIndex = this.quizBestScores.findIndex(q => q.quizId.toString() === quizId.toString());

  if (existingQuizIndex === -1) {
    // First attempt for this quiz
    this.quizBestScores.push({
      quizId,
      bestScore: score,
      bestScorePercentage: scorePercentage,
      isHighScore,
      lastAttemptDate: new Date(),
      lastCompetitionType: competitionType || 'none'
    });
  } else {
    // Update existing quiz score
    const existingQuiz = this.quizBestScores[existingQuizIndex];

    // Update best score if current score is higher
    if (scorePercentage > existingQuiz.bestScorePercentage) {
      existingQuiz.bestScore = score;
      existingQuiz.bestScorePercentage = scorePercentage;
      existingQuiz.isHighScore = isHighScore;
    }

    existingQuiz.lastAttemptDate = new Date();
    existingQuiz.lastCompetitionType = competitionType || 'none';
  }

  return {
    bestScore: this.quizBestScores.find(q => q.quizId.toString() === quizId.toString()),
    isNewBestScore: scorePercentage >= highScoreThreshold && (existingQuizIndex === -1 || !this.quizBestScores[existingQuizIndex].isHighScore)
  };
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

// Method to get quiz attempt status
userSchema.methods.getQuizAttemptStatus = function (quizId) {
  const existingQuiz = this.quizBestScores.find(q => q.quizId.toString() === quizId.toString());

  if (!existingQuiz) {
    return {
      hasAttempted: false,
      attemptsLeft: 1,
      bestScore: null,
      isHighScore: false,
      canAttempt: true
    };
  }

  return {
    hasAttempted: true,
    attemptsLeft: 0,
    bestScore: existingQuiz.bestScorePercentage,
    isHighScore: existingQuiz.isHighScore,
    canAttempt: false,
    attemptsUsed: 1
  };
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

// Static method to get historical level info
userSchema.statics.getHistoricalLevelInfo = async function (userId, competitionType, filterValue) {
  const now = new Date();
  const currentDate = now.toISOString().slice(0, 10);
  const currentMonth = now.toISOString().slice(0, 7);

  // Weekly current calculation
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  const currentWeek = `${now.getFullYear()}-W${weekNum}`;

  let isCurrent = false;
  if (competitionType === 'daily' && (!filterValue || filterValue === currentDate)) isCurrent = true;
  if (competitionType === 'weekly' && (!filterValue || filterValue === currentWeek)) isCurrent = true;
  if (competitionType === 'monthly' && (!filterValue || filterValue === currentMonth)) isCurrent = true;

  if (isCurrent) {
    const user = await this.findById(userId);
    if (!user) return null;
    return user.getLevelInfo(competitionType);
  }

  // Fetch from historical models
  let HistoricalModel;
  let query = { originalUserId: userId };

  if (competitionType === 'daily') {
    HistoricalModel = mongoose.models.PrevDailyPlayedUsers || mongoose.model('PrevDailyPlayedUsers');
    query.date = filterValue;
  } else if (competitionType === 'weekly') {
    HistoricalModel = mongoose.models.PrevWeeklyPlayedUsers || mongoose.model('PrevWeeklyPlayedUsers');
    query.week = filterValue;
  } else {
    HistoricalModel = mongoose.models.PrevMonthPlayedUsers || mongoose.model('PrevMonthPlayedUsers');
    query.monthYear = filterValue;
  }

  const record = await HistoricalModel.findOne(query);
  if (!record) return null;

  // Reconstruct levelInfo-like object from historical record
  const progress = competitionType === 'daily' ? record.dailyProgress :
    (competitionType === 'weekly' ? record.weeklyProgress : record.monthlyProgress);

  if (!progress) return null;

  const levelConfig = await this.getLevelConfig();
  const currentLevel = progress.currentLevel || 0;
  const maxLevel = Math.max(...Object.keys(levelConfig).map(Number));
  const nextLevel = Math.min(currentLevel + 1, maxLevel);

  return {
    currentLevel: {
      number: currentLevel,
      name: levelConfig[currentLevel]?.name || 'Unknown',
      description: levelConfig[currentLevel]?.description || '',
      quizzesRequired: levelConfig[currentLevel]?.quizzesRequired || 0
    },
    nextLevel: {
      number: nextLevel,
      name: levelConfig[nextLevel]?.name || levelConfig[currentLevel]?.name || 'Max Level',
      description: levelConfig[nextLevel]?.description || levelConfig[currentLevel]?.description || '',
      quizzesRequired: levelConfig[nextLevel]?.quizzesRequired || levelConfig[currentLevel]?.quizzesRequired || 0
    },
    progress: {
      quizzesPlayed: progress.totalQuizAttempts || 0,
      highScoreQuizzes: progress.highScoreWins || 0,
      progressPercentage: 0,
      quizzesToNextLevel: levelConfig[nextLevel]?.quizzesRequired || levelConfig[currentLevel]?.quizzesRequired || 0,
      quizzesToNextLevelRemaining: Math.max(0, (levelConfig[nextLevel]?.quizzesRequired || 0) - (progress.totalQuizAttempts || 0))
    },
    stats: {
      totalScore: progress.totalScore || 0,
      averageScore: progress.totalQuizAttempts > 0 ? Math.round(progress.totalScore / progress.totalQuizAttempts) : 0,
      lastLevelUp: record.savedAt || record.createdAt,
      highScoreRate: progress.totalQuizAttempts > 0 ? Math.round((progress.highScoreWins / progress.totalQuizAttempts) * 100) : 0
    }
  };
};

// Static method to get historical competition level
userSchema.statics.getHistoricalCompetitionLevel = async function (userId, competitionType, filterValue) {
  const info = await this.getHistoricalLevelInfo(userId, competitionType, filterValue);
  if (!info) return { currentLevel: 0, levelName: 'Starter' };
  return {
    currentLevel: info.currentLevel.number,
    levelName: info.currentLevel.name
  };
};


const User = mongoose.models.User || mongoose.model('User', userSchema);

// Hot reloading fix: ensure methods are updated on the registered model
if (User) {
  User.getLevelConfig = userSchema.statics.getLevelConfig;
  User.getRewardDistribution = userSchema.statics.getRewardDistribution;
  User.findActive = userSchema.statics.findActive;
  User.getUserStatsByStatus = userSchema.statics.getUserStatsByStatus;
  User.getHistoricalLevelInfo = userSchema.statics.getHistoricalLevelInfo;
  User.getHistoricalCompetitionLevel = userSchema.statics.getHistoricalCompetitionLevel;

  // Update instance methods as well
  User.prototype.updateLevel = userSchema.methods.updateLevel;
  User.prototype.ensureProgress = userSchema.methods.ensureProgress;
  User.prototype.ensureMonthlyProgress = userSchema.methods.ensureMonthlyProgress;
  User.prototype.addQuizCompletion = userSchema.methods.addQuizCompletion;
  User.prototype.getLevelInfo = userSchema.methods.getLevelInfo;
  User.prototype.canAttemptQuiz = userSchema.methods.canAttemptQuiz;
  User.prototype.updateQuizBestScore = userSchema.methods.updateQuizBestScore;
  User.prototype.getQuizAttemptStatus = userSchema.methods.getQuizAttemptStatus;
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
