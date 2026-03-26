import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
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
        const period = searchParams.get('period') || '30';
        const limit = parseInt(searchParams.get('limit')) || 20;
        let days;
        if (period === 'week') days = 7;
        else if (period === 'month') days = 30;
        else if (period === 'quarter') days = 90;
        else if (period === 'year') days = 365;
        else days = parseInt(period) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [performanceStatsResult, levelPerformance] = await Promise.all([
            QuizAttempt.aggregate([
                { $match: { attemptedAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: null, totalAttempts: { $sum: 1 }, averageScore: { $avg: '$scorePercentage' },
                        highScoreAttempts: { $sum: { $cond: [{ $gte: ['$scorePercentage', 70] }, 1, 0] } },
                        perfectScores: { $sum: { $cond: [{ $eq: ['$scorePercentage', 100] }, 1, 0] } }
                    }
                }
            ]),
            QuizAttempt.aggregate([
                { $match: { attemptedAt: { $gte: startDate } } },
                { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
                { $unwind: '$userInfo' },
                { $group: { _id: '$userInfo.level.currentLevel', avgScore: { $avg: '$scorePercentage' }, userCount: { $addToSet: '$user' } } },
                { $project: { avgScore: { $round: ['$avgScore', 2] }, userCount: { $size: '$userCount' } } },
                { $sort: { _id: 1 } }
            ])
        ]);

        const currentMonth = new Date().toISOString().slice(0, 7);
        const topPerformers = await User.find({ role: 'student', 'monthlyProgress.month': currentMonth })
            .select('name level monthlyProgress subscriptionStatus')
            .sort({ 'monthlyProgress.highScoreWins': -1, 'monthlyProgress.accuracy': -1 })
            .limit(limit).lean();

        return NextResponse.json({
            success: true,
            data: {
                period: `${days} days`,
                performanceStats: performanceStatsResult[0] || {},
                topPerformers, levelPerformance
            }
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
