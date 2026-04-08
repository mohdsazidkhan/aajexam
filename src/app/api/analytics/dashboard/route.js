import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, adminOnly } from '@/middleware/auth';
import config from '@/lib/config/appConfig';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !adminOnly(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const totalUsers = await User.countDocuments({ role: 'student' });

        const now = new Date();
        const activeProUsers = await User.countDocuments({
            role: 'student', subscriptionStatus: 'pro', subscriptionExpiry: { $gte: now }, status: 'active'
        });

        const PRIZE_PER_PRO = config.QUIZ_CONFIG.PRIZE_PER_PRO || 95;
        const MIN_POOL = config.QUIZ_CONFIG.MIN_MONTHLY_POOL || 650;
        const totalRevenue = 0; // PaymentOrder not always available
        const totalSubscriptions = await User.countDocuments({ role: 'student', subscriptionStatus: { $in: ['basic', 'premium', 'pro'] } });

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
                    totalUsers, totalNonAdminUsers: totalUsers, totalRevenue,
                    totalSubscriptions,
                    currentMonthActiveProUsers: activeProUsers,
                    dynamicPrizePool: Math.max(activeProUsers * PRIZE_PER_PRO, MIN_POOL),
                    prizePerPro: PRIZE_PER_PRO
                },
                subscriptionDistribution, levelDistribution, topUsers
            }
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
