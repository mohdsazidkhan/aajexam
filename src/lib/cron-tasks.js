import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import MonthlyWinners from '@/models/MonthlyWinners';
import PrevMonthPlayedUsers from '@/models/PrevMonthPlayedUsers';
import PrevDailyPlayedUsers from '@/models/PrevDailyPlayedUsers';
import PrevWeeklyPlayedUsers from '@/models/PrevWeeklyPlayedUsers';
import WalletTransaction from '@/models/WalletTransaction';
import { createNotification } from '@/utils/notifications';
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import config from '@/lib/config/appConfig';

// ─── Centralized thresholds — source of truth is appConfig ───────────────────
const MONTHLY_REWARD_QUIZ_REQUIREMENT = config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT || 50;
const WEEKLY_REWARD_QUIZ_REQUIREMENT  = config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT  || 20;
const DAILY_REWARD_QUIZ_REQUIREMENT   = config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT   || 5;
const MIN_ACCURACY                    = config.QUIZ_CONFIG.MONTHLY_MINIMUM_ACCURACY        || 60;
const MONTHLY_LEVEL_REQUIRED          = config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD || 0;

// ─── Winner counts per competition type ──────────────────────────────────────
const WINNER_COUNTS = {
    daily:   config.QUIZ_CONFIG.DAILY_WINNER_COUNT   || 1,
    weekly:  config.QUIZ_CONFIG.WEEKLY_WINNER_COUNT  || 3,
    monthly: config.QUIZ_CONFIG.MONTHLY_WINNER_COUNT || 5,
};

// ─── Prize distributions (must sum to 100% for each type) ────────────────────
const PRIZE_DISTRIBUTIONS = {
    daily: [
        { rank: 1, percentage: 100 }
    ],
    weekly: [
        { rank: 1, percentage: 50 },
        { rank: 2, percentage: 30 },
        { rank: 3, percentage: 20 }
    ],
    monthly: [
        { rank: 1, percentage: 35 },
        { rank: 2, percentage: 25 },
        { rank: 3, percentage: 20 },
        { rank: 4, percentage: 12 },
        { rank: 5, percentage: 8 }
    ]
};

// ─── Shared utility: get ISO-like week string ─────────────────────────────────
export function getISOWeekString(date) {
    const d = dayjs(date);
    const oneJan = new Date(d.year(), 0, 1);
    const numberOfDays = Math.floor((d.toDate() - oneJan) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    return `${d.year()}-W${weekNum}`;
}

// ─── Snapshot helpers — save eligible users before reset ─────────────────────

export const savePrevMonthPlayedUsers = async (forceRun = false, session = null) => {
    const today = dayjs();
    if (!forceRun) {
        const isLastDay = today.isSame(today.endOf('month'), 'day');
        if (!isLastDay) return { success: false, message: 'Not last day of month' };
    }

    const currentMonth = today.format('YYYY-MM');
    const eligibleUsers = await User.find({
        'monthlyProgress.currentLevel': { $gte: MONTHLY_LEVEL_REQUIRED },
        'monthlyProgress.highScoreWins': { $gte: MONTHLY_REWARD_QUIZ_REQUIREMENT },
        'monthlyProgress.accuracy': { $gte: MIN_ACCURACY }
    }, null, { session });

    for (const user of eligibleUsers) {
        const data = {
            ...user.toObject(),
            monthYear: currentMonth,
            originalUserId: user._id,
            savedAt: new Date()
        };
        delete data._id;

        await PrevMonthPlayedUsers.findOneAndUpdate(
            { originalUserId: user._id, monthYear: currentMonth },
            data,
            { upsert: true, session }
        );
    }

    return { success: true, savedCount: eligibleUsers.length, monthYear: currentMonth };
};

export const savePrevDailyPlayedUsers = async (forceRun = false, session = null) => {
    const today = dayjs();
    const currentDate = today.format('YYYY-MM-DD');
    const eligibleUsers = await User.find({
        'dailyProgress.highScoreWins': { $gte: DAILY_REWARD_QUIZ_REQUIREMENT },
        'dailyProgress.accuracy': { $gte: MIN_ACCURACY }
    }, null, { session });

    for (const user of eligibleUsers) {
        const data = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            userName: user.userName,
            dailyProgress: user.dailyProgress,
            quizBestScores: user.quizBestScores.filter(q => q.lastCompetitionType === 'daily'),
            originalUserId: user._id,
            date: currentDate,
            savedAt: new Date()
        };

        await PrevDailyPlayedUsers.findOneAndUpdate(
            { originalUserId: user._id, date: currentDate },
            data,
            { upsert: true, session }
        );
    }

    return { success: true, savedCount: eligibleUsers.length, date: currentDate };
};

export const savePrevWeeklyPlayedUsers = async (forceRun = false, session = null) => {
    const today = dayjs();
    const currentWeek = getISOWeekString(today.toDate());

    const eligibleUsers = await User.find({
        'weeklyProgress.highScoreWins': { $gte: WEEKLY_REWARD_QUIZ_REQUIREMENT },
        'weeklyProgress.accuracy': { $gte: MIN_ACCURACY }
    }, null, { session });

    for (const user of eligibleUsers) {
        const data = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            userName: user.userName,
            weeklyProgress: user.weeklyProgress,
            quizBestScores: user.quizBestScores.filter(q => q.lastCompetitionType === 'weekly'),
            originalUserId: user._id,
            week: currentWeek,
            savedAt: new Date()
        };

        await PrevWeeklyPlayedUsers.findOneAndUpdate(
            { originalUserId: user._id, week: currentWeek },
            data,
            { upsert: true, session }
        );
    }

    return { success: true, savedCount: eligibleUsers.length, week: currentWeek };
};

// ─── Prize pool calculation ───────────────────────────────────────────────────

export const calculatePrizePool = async (type) => {
    const DAILY_POOL_MULTIPLIER   = parseInt(process.env.DAILY_POOL_MULTIPLIER)   || 10;
    const WEEKLY_POOL_MULTIPLIER  = parseInt(process.env.WEEKLY_POOL_MULTIPLIER)  || 30;
    const MONTHLY_POOL_MULTIPLIER = parseInt(process.env.MONTHLY_POOL_MULTIPLIER) || 50;
    const DAILY_REWARD_DIVISOR    = parseInt(process.env.DAILY_REWARD_DIVISOR)    || 30;
    const WEEKLY_REWARD_DIVISOR   = parseInt(process.env.WEEKLY_REWARD_DIVISOR)   || 4;

    const FORMULAS = {
        daily:   (activeUsers) => (activeUsers * DAILY_POOL_MULTIPLIER) / DAILY_REWARD_DIVISOR,
        weekly:  (activeUsers) => (activeUsers * WEEKLY_POOL_MULTIPLIER) / WEEKLY_REWARD_DIVISOR,
        monthly: (activeUsers) => activeUsers * MONTHLY_POOL_MULTIPLIER
    };

    const MIN_POOLS = {
        daily: config.QUIZ_CONFIG.MIN_DAILY_POOL || 5,
        weekly: config.QUIZ_CONFIG.MIN_WEEKLY_POOL || 50,
        monthly: config.QUIZ_CONFIG.MIN_MONTHLY_POOL || 650
    };

    const today = new Date();
    const activeProUsers = await User.countDocuments({
        subscriptionStatus: 'pro',
        status: 'active',
        subscriptionExpiry: { $gte: today }
    });

    const calculatedPool = Math.round(FORMULAS[type](activeProUsers));
    const totalPrizePool = Math.max(calculatedPool, MIN_POOLS[type]);
    
    const distribution = PRIZE_DISTRIBUTIONS[type].map(d => ({
        ...d,
        amount: Math.round(totalPrizePool * (d.percentage / 100))
    }));

    return { totalPrizePool, distribution, activeProUsers };
};

// ─── Main competition reset logic ─────────────────────────────────────────────

export const runCompetitionReset = async (type, isDryRun = false) => {
    console.log(`[CronTasks] Starting competition reset. Type: ${type}, DryRun: ${isDryRun}`);
    const today = dayjs();
    const minAccuracy = config.QUIZ_CONFIG.MONTHLY_MINIMUM_ACCURACY || 60;
    const winnerCount = WINNER_COUNTS[type];

    let periodStr;
    let queryField;
    let requiredQuizzes;

    if (type === 'daily') {
        periodStr      = `daily-${today.format('YYYY-MM-DD')}`;
        queryField     = 'dailyProgress';
        requiredQuizzes = DAILY_REWARD_QUIZ_REQUIREMENT;
    } else if (type === 'weekly') {
        periodStr      = `weekly-${getISOWeekString(today.toDate())}`;
        queryField     = 'weeklyProgress';
        requiredQuizzes = WEEKLY_REWARD_QUIZ_REQUIREMENT;
    } else {
        periodStr      = today.format('YYYY-MM');
        queryField     = 'monthlyProgress';
        requiredQuizzes = MONTHLY_REWARD_QUIZ_REQUIREMENT;
    }

    const { distribution, totalPrizePool, activeProUsers } = await calculatePrizePool(type);

    console.log(`[CronTasks] Prize pool calculated for ${type}: ₹${totalPrizePool}`);
    // ── Find eligible winners ─────────────────────────────────────────────────
    // NOTE: PRO is NOT required to play — only for withdrawal.
    // We include ALL users in leaderboard; rewards are credited to wallet
    // but only withdrawable with PRO.
    const winnersUsers = await User.find({
        ...(type === 'monthly' ? { 'monthlyProgress.currentLevel': { $gte: MONTHLY_LEVEL_REQUIRED } } : {}),
        [`${queryField}.highScoreWins`]: { $gte: requiredQuizzes },
        [`${queryField}.accuracy`]: { $gte: minAccuracy },
        status: 'active'
    }).sort({
        [`${queryField}.highScoreWins`]: -1,
        [`${queryField}.accuracy`]: -1,
        [`${queryField}.totalScore`]: -1,
        [`${queryField}.totalQuizAttempts`]: -1
    }).limit(winnerCount);  // ← Only take Top 1/3/5 as configured

    console.log(`[CronTasks] Found ${winnersUsers.length} eligible winners for ${type}`);

    const winners = winnersUsers.map((user, i) => ({
        rank: i + 1,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        highScoreWins: user[queryField].highScoreWins,
        accuracy: user[queryField].accuracy,
        totalQuizAttempts: user[queryField].totalQuizAttempts,
        totalCorrectAnswers: user[queryField].totalCorrectAnswers,
        rewardAmount: distribution[i]?.amount || 0,
        claimableRewards: (user.claimableRewards || 0) + (distribution[i]?.amount || 0)
    }));

    if (isDryRun) {
        return { success: true, isDryRun: true, type, periodStr, winners, totalPrizePool, activeProUsers };
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log(`[CronReset] Starting ${type} reset for period ${periodStr}...`);

        // ── 1. Snapshot eligible users before wiping progress ─────────────────
        if (type === 'monthly') {
            await savePrevMonthPlayedUsers(true, session);
        } else if (type === 'daily') {
            await savePrevDailyPlayedUsers(true, session);
        } else if (type === 'weekly') {
            await savePrevWeeklyPlayedUsers(true, session);
        }

        // ── 2. Archive winners ────────────────────────────────────────────────
        if (winnersUsers.length > 0) {
            console.log(`[CronTasks] Archiving ${winners.length} winners to MonthlyWinners...`);
            await MonthlyWinners.findOneAndUpdate(
                { monthYear: periodStr, competitionType: type },
                {
                    competitionType: type,
                    month: today.format('MM'),
                    year: today.year(),
                    monthYear: periodStr,
                    winners,
                    totalPrizePool,
                    totalWinners: winners.length,
                    resetDate: new Date(),
                    metadata: { activeProUsers }
                },
                { upsert: true, new: true, session }
            );
            console.log('[CronTasks] Archive complete. Crediting wallets...');

            // ── 3. Credit winners with idempotency protection ─────────────────
            for (let i = 0; i < winnersUsers.length; i++) {
                const user = winnersUsers[i];
                const rewardAmount = distribution[i]?.amount || 0;
                if (rewardAmount <= 0) continue;

                // Idempotency key prevents duplicate reward on cron re-run
                const idempotencyKey = `competition-${type}-${periodStr}-rank-${i + 1}-user-${user._id}`;
                const alreadyCredited = await WalletTransaction.findOne({ idempotencyKey }).session(session);
                if (alreadyCredited) {
                    console.warn(`[CronReset] Skipping duplicate reward for ${user._id} (${idempotencyKey})`);
                    continue;
                }

                // Atomically increment claimable rewards (NOT wallet balance yet)
                const updatedUser = await User.findOneAndUpdate(
                    { _id: user._id },
                    {
                        $inc: { claimableRewards: rewardAmount },
                        $set: { [`${queryField}.rewardRank`]: i + 1 }
                    },
                    { new: true, session }
                );

                // Create auditable transaction record
                await WalletTransaction.create([{
                    user: user._id,
                    type: 'credit',
                    amount: rewardAmount,
                    balance: updatedUser.walletBalance,
                    description: `${type.charAt(0).toUpperCase() + type.slice(1)} competition reward — Rank #${i + 1} (${periodStr})`,
                    category: 'competition_reward',
                    idempotencyKey,
                    status: 'completed'
                }], { session });
            }
        }

        // ── 4. Mark monthly top performers (for UI ranking only) ──────────────
        if (type === 'monthly') {
            const winnerIds = winnersUsers.map(u => u._id);
            // FIX: Only update isTopPerformer flag, do NOT touch badges for ALL users
            if (winnerIds.length > 0) {
                await User.updateMany({ _id: { $in: winnerIds } }, { $set: { isTopPerformer: true } }, { session });
                await User.updateMany(
                    { _id: { $nin: winnerIds }, isTopPerformer: true },
                    { $set: { isTopPerformer: false } },
                    { session }
                );
            }
        }

        // ── 5. Reset competition-period stats (NOT lifetime level or badges) ──
        const nextPeriodUpdate = buildNextPeriodReset(type, today);
        await User.updateMany({}, nextPeriodUpdate, { session });

        // ── 6. Clear ONLY the competition-type-specific quiz attempts ─────────
        // FIX: Always use a competitionType filter — never wipe all attempts
        if (type === 'monthly') {
            await QuizAttempt.deleteMany({ competitionType: 'monthly' }, { session });
        } else if (type === 'weekly') {
            await QuizAttempt.deleteMany({ competitionType: 'weekly' }, { session });
            await User.updateMany(
                {},
                { $pull: { quizBestScores: { lastCompetitionType: 'weekly' } } },
                { session }
            );
        } else if (type === 'daily') {
            await QuizAttempt.deleteMany({ competitionType: 'daily' }, { session });
            await User.updateMany(
                {},
                { $pull: { quizBestScores: { lastCompetitionType: 'daily' } } },
                { session }
            );
        }

        // ── 7. Admin notification ─────────────────────────────────────────────
        await createNotification({
            userId: null,
            type: 'competition_reset',
            title: `${type.toUpperCase()} Competition Reset Completed`,
            description: `Reset ${type} for ${periodStr}. Winners: ${winnersUsers.length}. Prize pool: ₹${totalPrizePool}.`,
            meta: { type, periodStr, winnersCount: winnersUsers.length, totalPrizePool }
        });

        await session.commitTransaction();
        console.log(`[CronReset] ✅ ${type} reset completed for ${periodStr}. Winners: ${winnersUsers.length}`);
        return { success: true, winnersCount: winnersUsers.length, totalPrizePool, periodStr };

    } catch (error) {
        await session.abortTransaction();
        console.error(`[CronReset] ❌ ${type} reset failed for ${periodStr}:`, error);
        throw error;
    } finally {
        session.endSession();
    }
};

// ─── Builds the $set update for next period reset (no destructive wipes) ─────
function buildNextPeriodReset(type, today) {
    if (type === 'daily') {
        return {
            $set: {
                'dailyProgress.date':             today.add(1, 'day').format('YYYY-MM-DD'),
                'dailyProgress.highScoreWins':    0,
                'dailyProgress.totalQuizAttempts': 0,
                'dailyProgress.accuracy':          0,
                'dailyProgress.totalScore':        0,
                'dailyProgress.totalCorrectAnswers': 0,
                'dailyProgress.rewardEligible':    false,
                'dailyProgress.rewardRank':        null
            }
        };
    } else if (type === 'weekly') {
        const nextWeek = today.add(1, 'week');
        return {
            $set: {
                'weeklyProgress.week':              getISOWeekString(nextWeek.toDate()),
                'weeklyProgress.highScoreWins':     0,
                'weeklyProgress.totalQuizAttempts': 0,
                'weeklyProgress.accuracy':           0,
                'weeklyProgress.totalScore':         0,
                'weeklyProgress.totalCorrectAnswers': 0,
                'weeklyProgress.rewardEligible':     false,
                'weeklyProgress.rewardRank':         null
            }
        };
    } else {
        // MONTHLY: Reset ONLY monthlyProgress stats.
        // FIX: Do NOT reset globalLevel, badges, quizBestScores, or level fields that don't exist.
        // Daily and weekly progress are reset by their own cron jobs.
        return {
            $set: {
                'monthlyProgress.month':              today.add(1, 'month').format('YYYY-MM'),
                'monthlyProgress.highScoreWins':      0,
                'monthlyProgress.totalQuizAttempts':  0,
                'monthlyProgress.accuracy':            0,
                'monthlyProgress.totalScore':          0,
                'monthlyProgress.totalCorrectAnswers': 0,
                'monthlyProgress.currentLevel':        0,
                'monthlyProgress.rewardEligible':      false,
                'monthlyProgress.rewardRank':          null
                // ⛔ NOT resetting: globalLevel, badges, quizBestScores
                // Those are lifetime achievements and must persist across resets
            }
        };
    }
}

// ─── Convenient named exports used by cron route handlers ────────────────────
export const runDailyReset   = () => runCompetitionReset('daily');
export const runWeeklyReset  = () => runCompetitionReset('weekly');
export const runMonthlyReset = () => runCompetitionReset('monthly');
