import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import { protect, admin } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { id } = params;
        await dbConnect();

        const user = await User.findById(userId).select('name level subscriptionStatus');
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        const attempts = await QuizAttempt.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: '$scorePercentage' },
                    perfectScores: { $sum: { $cond: [{ $eq: ['$scorePercentage', 100] }, 1, 0] } }
                }
            }
        ]);

        const stats = attempts[0] || { totalAttempts: 0, averageScore: 0, perfectScores: 0 };

        return NextResponse.json({
            success: true,
            data: {
                user,
                performance: {
                    totalAttempts: stats.totalAttempts,
                    averageScore: Math.round(stats.averageScore),
                    perfectScores: stats.perfectScores
                }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
