import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const QuizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [{ questionId: String, answer: String }],
  score: { type: Number, required: true },
  scorePercentage: { type: Number, required: true },
  isBestScore: { type: Boolean, default: true },
  rank: { type: Number, default: 0 },
  attemptedAt: { type: Date, default: Date.now },

  // Additional fields for better tracking and security
  timeSpent: { type: Number, default: 0 }, // Time spent in seconds
  deviceInfo: { type: String }, // Device/browser info
  ipAddress: { type: String }, // IP address for security
  sessionId: { type: String }, // Session ID for tracking

  // Tracking fields
  userAgent: { type: String }, // Full user agent string
  timestamp: { type: Date, default: Date.now }, // Precise timestamp
  competitionType: { type: String, enum: ['daily', 'weekly', 'monthly', 'none'], default: 'none' },

  // Phase 3: period identifier for efficient per-period deduplication
  // daily='YYYY-MM-DD', weekly='YYYY-Wn', monthly='YYYY-MM', none=''
  period: { type: String, default: '' }
});

// Remove old static unique index to allow periodic retakes
// QuizAttemptSchema.index({ user: 1, quiz: 1 }, { unique: true });

// New index for performance and period checks
QuizAttemptSchema.index({ user: 1, quiz: 1, competitionType: 1, attemptedAt: -1 });

// Index for performance on user queries
QuizAttemptSchema.index({ user: 1, attemptedAt: -1 });

// Index for quiz leaderboard queries
QuizAttemptSchema.index({ quiz: 1, scorePercentage: -1, attemptedAt: 1 });

// Index for efficient deduplication and period-based queries
QuizAttemptSchema.index({ user: 1, quiz: 1, period: 1 });

// Pre-save middleware to validate user status
QuizAttemptSchema.pre('save', async function (next) {
  try {
    // Check if user exists and is active
    const User = mongoose.model('User');
    const user = await User.findById(this.user);

    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.status !== 'active') {
      return next(new Error(`Cannot create quiz attempt. User account is ${user.status}`));
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to create quiz attempt with comprehensive security checks
QuizAttemptSchema.statics.createAttempt = async function (attemptData) {
  // Security/metadata
  const secureAttemptData = {
    ...attemptData,
    timestamp: new Date(),
    userAgent: attemptData.userAgent || 'Unknown',
    ipAddress: attemptData.ipAddress || 'Unknown',
    sessionId: attemptData.sessionId || 'Unknown',
    competitionType: attemptData.competitionType || 'none'
  };

  try {
    const attempt = new this(secureAttemptData);
    await attempt.save();
    return attempt;
  } catch (error) {
    throw error;
  }
};

// NOTE: Fraud detection, suspicious activity reporting and auto-suspension
// utilities were intentionally removed from the model to keep attempt
// creation simple and to centralize policy decisions in higher layers.

// Static method to get user's quiz attempts
QuizAttemptSchema.statics.getUserAttempts = function (userId, limit = 50, skip = 0) {
  return this.find({ user: userId })
    .populate('quiz', 'title category difficulty')
    .sort({ attemptedAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get quiz leaderboard
QuizAttemptSchema.statics.getQuizLeaderboard = function (quizId, limit = 100) {
  return this.find({ quiz: quizId })
    .populate('user', 'name profilePicture')
    .sort({ scorePercentage: -1, attemptedAt: 1 })
    .limit(limit);
};

// Suspicious activity reporting removed. Use external monitoring or a
// dedicated admin tool to inspect attempts if needed.

// Auto-suspension removed. Automated suspension should be handled by a
// scoped administrative process to avoid accidental user lockouts.

const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', QuizAttemptSchema);
export default QuizAttempt;
