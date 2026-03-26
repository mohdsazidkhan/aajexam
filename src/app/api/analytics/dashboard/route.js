import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import { protect, adminOnly } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !adminOnly(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const [totalUsers, totalQuizzes, totalAttempts] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            Quiz.countDocuments(),
            QuizAttempt.countDocuments()
        ]);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsersCount = (await QuizAttempt.distinct('user', { attemptedAt: { $gte: thirtyDaysAgo } })).length;

        const now = new Date();
        const activeProUsers = await User.countDocuments({
            role: 'student', subscriptionStatus: 'pro', subscriptionExpiry: { $gte: now }, status: 'active'
        });

        const PRIZE_PER_PRO = Number(process.env.NEXT_PUBLIC_PRIZE_PER_PRO || process.env.PRIZE_PER_PRO || 90);
        const totalRevenue = 0; // PaymentOrder not always available
        const totalSubscriptions = await User.countDocuments({ role: 'student', subscriptionStatus: { $in: ['basic', 'premium', 'pro'] } });

        const recentActivity = await QuizAttempt.find()
            .populate('user', 'name').populate('quiz', 'title')
            .sort({ attemptedAt: -1 }).limit(limit).select('score scorePercentage attemptedAt');

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
        const topUsers = await User.find({ role: 'student', 'monthlyProgress.month': currentMonth })
            .select('name level monthlyProgress')
            .sort({ 'monthlyProgress.highScoreWins': -1, 'monthlyProgress.accuracy': -1 })
            .limit(limit).lean();

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalUsers, totalNonAdminUsers: totalUsers, totalQuizzes, totalAttempts, totalRevenue,
                    activeUsers: activeUsersCount, totalSubscriptions,
                    currentMonthActiveProUsers: activeProUsers,
                    dynamicPrizePool: activeProUsers * PRIZE_PER_PRO,
                    prizePerPro: PRIZE_PER_PRO
                },
                recentActivity, subscriptionDistribution, levelDistribution, topUsers
            }
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
