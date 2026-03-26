import mongoose from 'mongoose';

/**
 * CompetitionProgress
 * Separate collection for per-user, per-period competition stats.
 * Replaces the embedded dailyProgress/weeklyProgress/monthlyProgress in User model.
 *
 * This is Phase 3 — User model remains backward-compatible during migration.
 * Old embedded fields still exist on User doc; once migration is verified,
 * they will be removed.
 */
const CompetitionProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    // period: '2025-01-15' (daily), '2025-W3' (weekly), '2025-01' (monthly)
    period: {
        type: String,
        required: true,
        index: true
    },
    // Core competition stats
    highScoreWins: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAttempts: {
        type: Number,
        default: 0,
        min: 0
    },
    accuracy: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    totalScore: {
        type: Number,
        default: 0
    },
    totalCorrectAnswers: {
        type: Number,
        default: 0
    },
    currentLevel: {
        type: Number,
        default: 0,
        min: 0
    },
    levelName: {
        type: String,
        default: 'Starter'
    },
    // Eligibility flag (computed on each quiz submit)
    rewardEligible: {
        type: Boolean,
        default: false,
        index: true
    },
    // Set after cron runs — no rewardRank until period closed
    rewardRank: {
        type: Number,
        default: null
    },
    // Set to 'open' when period is active, 'closed' after cron processes it
    periodStatus: {
        type: String,
        enum: ['open', 'closed', 'rewarded'],
        default: 'open',
        index: true
    }
}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────
// Unique: one document per user per competition type per period
CompetitionProgressSchema.index({ userId: 1, type: 1, period: 1 }, { unique: true });

// Leaderboard sort index: by type + period + stats descending
CompetitionProgressSchema.index({
    type: 1, period: 1, periodStatus: 1,
    highScoreWins: -1, accuracy: -1, totalScore: -1
});

// Eligibility queries (for cron winner selection)
CompetitionProgressSchema.index({ type: 1, period: 1, rewardEligible: 1, highScoreWins: -1 });

// ── Static Methods ────────────────────────────────────────────────────────────

/**
 * Upsert progress stats after a quiz attempt.
 * Called atomically with $inc to prevent race conditions.
 */
CompetitionProgressSchema.statics.recordAttempt = async function ({
    userId, type, period, isHighScore, score, totalQuestions, correctAnswers,
    currentLevel, levelName, threshold, minAccuracy
}) {
    const result = await this.findOneAndUpdate(
        { userId, type, period },
        {
            $inc: {
                totalAttempts:      1,
                totalScore:         totalQuestions,
                totalCorrectAnswers: correctAnswers,
                ...(isHighScore ? { highScoreWins: 1 } : {})
            },
            $setOnInsert: {
                userId, type, period, periodStatus: 'open'
            }
        },
        { upsert: true, new: true }
    );

    // Recalculate accuracy and eligibility after the update
    const accuracy = result.totalAttempts > 0
        ? Math.round((result.highScoreWins / result.totalAttempts) * 100) : 0;

    const rewardEligible = result.highScoreWins >= threshold && accuracy >= minAccuracy;

    await this.updateOne(
        { _id: result._id },
        { $set: { accuracy, rewardEligible, currentLevel, levelName } }
    );

    return { ...result.toObject(), accuracy, rewardEligible };
};

/**
 * Get leaderboard for a given type+period using aggregation.
 * Returns paginated result with user info joined.
 */
CompetitionProgressSchema.statics.getLeaderboard = async function ({
    type, period, page = 1, limit = 20, currentUserId = null
}) {
    const skip = (page - 1) * limit;

    const pipeline = [
        { $match: { type, period, totalAttempts: { $gt: 0 } } },
        { $sort: { highScoreWins: -1, accuracy: -1, totalScore: -1 } },
        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'user',
                            pipeline: [
                                { $project: { name: 1, username: 1, badges: 1, subscriptionStatus: 1, profilePicture: 1 } }
                            ]
                        }
                    },
                    { $unwind: { path: '$user', preserveNullAndEmpty: true } }
                ],
                total: [{ $count: 'count' }]
            }
        }
    ];

    const [result] = await this.aggregate(pipeline);
    const total = result.total[0]?.count || 0;

    // Map leaderboard with rank
    const leaderboard = result.data.map((doc, i) => ({
        rank:            skip + i + 1,
        studentId:       doc.userId,
        studentName:     doc.user?.name || 'Anonymous',
        username:        doc.user?.username || null,
        isCurrentUser:   currentUserId ? String(doc.userId) === String(currentUserId) : false,
        badges:          doc.user?.badges || [],
        subscriptionStatus: doc.user?.subscriptionStatus || 'free',
        profilePicture:  doc.user?.profilePicture || null,
        stats: {
            highScoreWins:    doc.highScoreWins,
            accuracy:         doc.accuracy,
            totalAttempts:    doc.totalAttempts,
            totalScore:       doc.totalScore,
            rewardEligible:   doc.rewardEligible
        },
        level: { currentLevel: doc.currentLevel, levelName: doc.levelName }
    }));

    return {
        leaderboard,
        pagination: {
            currentPage: page,
            totalPages:  Math.ceil(total / limit),
            totalUsers:  total,
            hasNextPage: skip + result.data.length < total,
            hasPrevPage: page > 1
        }
    };
};

const CompetitionProgress = mongoose.models.CompetitionProgress
    || mongoose.model('CompetitionProgress', CompetitionProgressSchema);

export default CompetitionProgress;
