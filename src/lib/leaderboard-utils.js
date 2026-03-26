import dbConnect from '@/lib/db';
import User from '@/models/User';
import dayjs from 'dayjs';
import config from '@/lib/config/appConfig';
import { getISOWeekString } from '@/lib/cron-tasks';

// ─── Centralized thresholds ───────────────────────────────────────────────────
const THRESHOLDS = {
    daily:   config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT   || 5,
    weekly:  config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT  || 20,
    monthly: config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT || 50,
};
const MIN_ACCURACY = config.QUIZ_CONFIG.MONTHLY_MINIMUM_ACCURACY || 70;

export async function getCompetitionLeaderboard(type, page = 1, limit = 20, filters = {}, currentUserId = null) {
    await dbConnect();
    const skip = (page - 1) * limit;
    const now = dayjs();

    let queryField;
    let periodValue;
    let periodKey;

    if (type === 'daily') {
        queryField   = 'dailyProgress';
        periodKey    = 'date';
        periodValue  = filters.date || now.format('YYYY-MM-DD');
    } else if (type === 'weekly') {
        queryField   = 'weeklyProgress';
        periodKey    = 'week';
        periodValue  = filters.week || getISOWeekString(now.toDate());
    } else {
        queryField   = 'monthlyProgress';
        periodKey    = 'month';
        periodValue  = filters.month || filters.date || now.format('YYYY-MM');
    }

    const baseQuery = {
        role: 'student',
        status: 'active',
        [`${queryField}.${periodKey}`]: periodValue,
        [`${queryField}.totalQuizAttempts`]: { $gt: 0 }
    };

    const [users, total] = await Promise.all([
        User.find(baseQuery)
            .select(`name username badges subscriptionStatus profilePicture ${queryField} monthlyProgress claimableRewards`)
            .sort({
                [`${queryField}.highScoreWins`]:     -1,
                [`${queryField}.accuracy`]:          -1,
                [`${queryField}.totalScore`]:        -1,
                [`${queryField}.totalQuizAttempts`]: -1
            })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(baseQuery)
    ]);

    const reqQuizzes = THRESHOLDS[type];

    const leaderboard = users.map((user, index) => {
        const progress = user[queryField];
        const globalRank = skip + index + 1;
        const attempted   = progress.totalQuizAttempts || 0;
        const highScores  = progress.highScoreWins || 0;
        const accuracy    = progress.accuracy || 0;
        const rewardEligible = progress.rewardEligible || (highScores >= reqQuizzes && accuracy >= MIN_ACCURACY);

        // Near-win calculation
        const quizzesRemaining = Math.max(0, reqQuizzes - highScores);
        const nearWin = !rewardEligible && quizzesRemaining > 0 && quizzesRemaining <= 3;

        return {
            rank:         globalRank,
            studentId:    user._id,
            studentName:  user.name || 'Anonymous',
            username:     user.username || null,
            isCurrentUser: currentUserId ? String(user._id) === String(currentUserId) : false,
            stats: {
                highScoreWins:    highScores,
                accuracy,
                totalQuizAttempts: attempted,
                totalScore:       progress.totalScore || 0,
                totalCorrectAnswers: progress.totalCorrectAnswers || 0,
                rewardEligible,
                // Near-win fields for growth hooks
                quizzesRemaining,
                nearWin,
                nearWinMessage: nearWin
                    ? `${quizzesRemaining} more high-score quiz${quizzesRemaining > 1 ? 'zes' : ''} to qualify for ${type} rewards!`
                    : null
            },
            level: {
                currentLevel: user.monthlyProgress?.currentLevel || 0,
                levelName:    user.monthlyProgress?.levelName    || 'Starter'
            },
            badges:             user.badges || [],
            subscriptionStatus: user.subscriptionStatus || 'free',
            profilePicture:     user.profilePicture || null
        };
    });

    // If currentUserId provided, find their rank even if not in this page
    let currentUserRank = null;
    if (currentUserId) {
        const currentUserInPage = leaderboard.find(u => u.isCurrentUser);
        if (!currentUserInPage) {
            // Count how many users rank above the current user
            const currentUserProgress = await User.findById(currentUserId)
                .select(`${queryField}`)
                .lean();
            if (currentUserProgress) {
                const p = currentUserProgress[queryField];
                if (p) {
                    const aboveCount = await User.countDocuments({
                        ...baseQuery,
                        $or: [
                            { [`${queryField}.highScoreWins`]:    { $gt: p.highScoreWins || 0 } },
                            { [`${queryField}.highScoreWins`]:    p.highScoreWins || 0, [`${queryField}.accuracy`]: { $gt: p.accuracy || 0 } },
                        ]
                    });
                    currentUserRank = aboveCount + 1;
                }
            }
        } else {
            currentUserRank = currentUserInPage.rank;
        }
    }

    return {
        leaderboard,
        currentUserRank,
        pagination: {
            currentPage: page,
            totalPages:  Math.ceil(total / limit),
            totalUsers:  total,
            hasNextPage: skip + users.length < total,
            hasPrevPage: page > 1
        }
    };
}
