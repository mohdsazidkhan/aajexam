import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
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
        let days;
        if (period === 'week') days = 7;
        else if (period === 'month') days = 30;
        else if (period === 'quarter') days = 90;
        else if (period === 'year') days = 365;
        else days = parseInt(period) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [userGrowth, levelDistribution, subscriptionStats] = await Promise.all([
            User.aggregate([
                { $match: { role: 'student', createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]),
            User.aggregate([
                { $match: { role: 'student' } },
                { $group: { _id: '$level.currentLevel', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            User.aggregate([
                { $match: { role: 'student' } },
                { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } }
            ])
        ]);

        return NextResponse.json({
            success: true,
            data: { period: `${days} days`, userGrowth, levelDistribution, subscriptionStats }
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
