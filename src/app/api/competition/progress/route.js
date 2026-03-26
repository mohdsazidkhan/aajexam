import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';
import config from '@/lib/config/appConfig';
import { getISOWeekString } from '@/lib/cron-tasks';
import dayjs from 'dayjs';

const THRESHOLDS = {
    daily:   config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT   || 5,
    weekly:  config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT  || 20,
    monthly: config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT || 50,
};
const MIN_ACCURACY = config.QUIZ_CONFIG.MONTHLY_MINIMUM_ACCURACY || 70;

// ─── GET /api/competition/progress?type=daily|weekly|monthly ─────────────────
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'monthly'; // daily | weekly | monthly
        const validTypes = ['daily', 'weekly', 'monthly'];
        if (!validTypes.includes(type)) {
            return NextResponse.json({ message: 'Invalid type. Use: daily, weekly, monthly' }, { status: 400 });
        }

        const user = await User.findById(auth.user.id)
            .select('dailyProgress weeklyProgress monthlyProgress walletBalance claimableRewards subscriptionStatus')
            .lean();
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const now = dayjs();
        const progress = user[`${type}Progress`];
        const threshold = THRESHOLDS[type];
        const isPro = user.subscriptionStatus === 'pro';

        // Core stats
        const highScoreWins    = progress?.highScoreWins    || 0;
        const totalAttempts    = progress?.totalQuizAttempts || 0;
        const accuracy         = progress?.accuracy         || 0;
        const totalScore       = progress?.totalScore       || 0;
        const currentLevel     = progress?.currentLevel     || 0;
        const levelName        = progress?.levelName        || 'Starter';
        const rewardEligible   = progress?.rewardEligible   ||
            (highScoreWins >= threshold && accuracy >= MIN_ACCURACY);

        // Progress percentage toward eligibility (0-100)
        const progressPct = Math.min(100, Math.round((highScoreWins / threshold) * 100));

        // Near-win: within 3 high-score quizzes of qualifying
        const quizzesRemaining = Math.max(0, threshold - highScoreWins);
        const accuracyShortfall = Math.max(0, MIN_ACCURACY - accuracy);
        const nearWin = !rewardEligible && quizzesRemaining > 0 && quizzesRemaining <= 3 && accuracyShortfall === 0;

        // Period identifiers
        const periodMap = {
            daily:   now.format('YYYY-MM-DD'),
            weekly:  getISOWeekString(now.toDate()),
            monthly: now.format('YYYY-MM')
        };

        // Withdrawal hint
        const walletBalance = user.walletBalance || 0;
        const claimable     = user.claimableRewards || 0;
        const withdrawHint  = !isPro && walletBalance > 0
            ? `₹${walletBalance} waiting — upgrade PRO for ₹99 to withdraw`
            : null;

        return NextResponse.json({
            success: true,
            data: {
                type,
                period: periodMap[type],
                // Raw stats
                highScoreWins,
                totalAttempts,
                accuracy,
                totalScore,
                currentLevel,
                levelName,
                // Eligibility
                rewardEligible,
                threshold,
                minAccuracy: MIN_ACCURACY,
                progressPercent: progressPct,
                quizzesRemaining,
                accuracyShortfall,
                // Near-win hook
                nearWin,
                nearWinMessage: nearWin
                    ? `🔥 ${quizzesRemaining} more high-score quiz${quizzesRemaining > 1 ? 'zes' : ''} and you qualify for ${type} rewards!`
                    : null,
                // Rank info
                rewardRank: progress?.rewardRank || null,
                // Wallet motivation
                walletBalance,
                claimableRewards: claimable,
                isPro,
                withdrawHint,
                // Time remaining in period (for urgency countdown)
                periodEndsAt: getPeriodEndTime(type, now),
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

function getPeriodEndTime(type, now) {
    if (type === 'daily') {
        return now.endOf('day').toISOString();
    } else if (type === 'weekly') {
        // Next Sunday 23:59:59
        const daysUntilSunday = 7 - now.day();
        return now.add(daysUntilSunday === 7 ? 0 : daysUntilSunday, 'day').endOf('day').toISOString();
    } else {
        return now.endOf('month').toISOString();
    }
}
