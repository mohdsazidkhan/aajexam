import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import PaymentOrder from '@/models/PaymentOrder';
import config from '@/lib/config/appConfig';

const calculateTotalRevenue = async () => {
    const revenueSummary = await PaymentOrder.aggregate([
        { $match: { payuStatus: 'success' } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' }
            }
        }
    ]);
    return revenueSummary[0]?.totalRevenue || 0;
};

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const totalUsers = await User.countDocuments({ role: 'student' });
        const totalQuizzes = await Quiz.countDocuments();
        const totalAttempts = await QuizAttempt.countDocuments();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsersCount = (await QuizAttempt.distinct('user', {
            attemptedAt: { $gte: thirtyDaysAgo }
        })).length;

        const now = new Date();
        const activeProUsers = await User.countDocuments({
            role: 'student',
            subscriptionStatus: 'pro',
            subscriptionExpiry: { $gte: now },
            status: 'active'
        });

        const PRIZE_PER_PRO = config.QUIZ_CONFIG.PRIZE_PER_PRO || 95;
        const MIN_POOL = config.QUIZ_CONFIG.MIN_MONTHLY_POOL || 650;
        const dynamicPrizePool = Math.max(activeProUsers * PRIZE_PER_PRO, MIN_POOL);

        const totalRevenue = await calculateTotalRevenue();

        const totalSubscriptions = await User.countDocuments({
            role: 'student',
            subscriptionStatus: { $in: ['basic', 'premium', 'pro'] }
        });

        const recentActivity = await QuizAttempt.find()
            .populate('user', 'name')
            .populate('quiz', 'title')
            .sort({ attemptedAt: -1 })
            .limit(limit)
            .select('score scorePercentage attemptedAt');

        const subscriptionDistribution = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } }
        ]);

        const levelDistribution = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: '$level.currentLevel', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const currentMonth = new Date().toISOString().slice(0, 7);
        const topUsers = await User.find({
            role: 'student',
            'monthlyProgress.month': currentMonth
        })
            .select('name level monthlyProgress')
            .sort({ 'monthlyProgress.highScoreWins': -1, 'monthlyProgress.accuracy': -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalNonAdminUsers: totalUsers,
                    totalQuizzes,
                    totalAttempts,
                    totalRevenue,
                    activeUsers: activeUsersCount,
                    activeUsersCurrentMonth: activeUsersCount,
                    totalSubscriptions,
                    currentMonthActiveProUsers: activeProUsers,
                    dynamicPrizePool,
                    prizePerPro: PRIZE_PER_PRO
                },
                recentActivity,
                subscriptionDistribution,
                levelDistribution,
                topUsers
            }
        });

    } catch (error) {
        console.error('Dashboard analytics error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
