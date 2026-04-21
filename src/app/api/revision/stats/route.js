import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RevisionQueue from '@/models/RevisionQueue';
import { protect } from '@/middleware/auth';

// GET - Revision statistics
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const userId = auth.user._id;

        const [stats] = await RevisionQueue.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avgEaseFactor: { $avg: '$easeFactor' },
                    totalReviews: { $sum: '$totalReviews' },
                    totalCorrect: { $sum: '$correctReviews' }
                }
            },
            {
                $group: {
                    _id: null,
                    statuses: { $push: { status: '$_id', count: '$count', avgEaseFactor: '$avgEaseFactor' } },
                    totalReviews: { $sum: '$totalReviews' },
                    totalCorrect: { $sum: '$totalCorrect' },
                    totalItems: { $sum: '$count' }
                }
            }
        ]);

        const now = new Date();
        const dueToday = await RevisionQueue.countDocuments({
            user: userId,
            status: 'active',
            nextReviewDate: { $lte: now }
        });

        const upcoming7Days = await RevisionQueue.countDocuments({
            user: userId,
            status: 'active',
            nextReviewDate: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
        });

        const bySourceAgg = await RevisionQueue.aggregate([
            { $match: { user: userId, status: 'active', nextReviewDate: { $lte: now } } },
            { $group: { _id: '$source', count: { $sum: 1 } } }
        ]);
        const bySource = { quiz: 0, practice_test: 0, daily_challenge: 0, reel: 0 };
        bySourceAgg.forEach(c => { bySource[c._id] = c.count; });

        return NextResponse.json({
            success: true,
            data: {
                totalItems: stats?.totalItems || 0,
                totalReviews: stats?.totalReviews || 0,
                accuracy: stats?.totalReviews > 0 ? Math.round((stats.totalCorrect / stats.totalReviews) * 100) : 0,
                statuses: stats?.statuses || [],
                dueToday,
                upcoming7Days,
                bySource
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
