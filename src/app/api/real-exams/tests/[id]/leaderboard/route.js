import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id: testId } = await params;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 10;

        const filter = { practiceTest: new mongoose.Types.ObjectId(testId), status: 'Completed' };

        const [leaderboard, statsAgg] = await Promise.all([
            UserTestAttempt.find(filter)
                .populate('user', 'name username email')
                .sort({ score: -1, accuracy: -1, totalTime: 1, submittedAt: 1 })
                .limit(limit)
                .select('user score correctCount accuracy rank percentile totalTime submittedAt')
                .lean(),
            UserTestAttempt.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalParticipants: { $sum: 1 },
                        topScore: { $max: '$score' },
                        avgScore: { $avg: '$score' },
                        avgAccuracy: { $avg: '$accuracy' },
                        avgTime: { $avg: '$totalTime' }
                    }
                }
            ])
        ]);

        const stats = statsAgg[0] || { totalParticipants: 0, topScore: 0, avgScore: 0, avgAccuracy: 0, avgTime: 0 };

        return NextResponse.json({
            success: true,
            data: leaderboard,
            count: leaderboard.length,
            stats: {
                totalParticipants: stats.totalParticipants,
                topScore: stats.topScore,
                avgScore: Number((stats.avgScore || 0).toFixed(2)),
                avgAccuracy: Number((stats.avgAccuracy || 0).toFixed(2)),
                avgTime: Math.round(stats.avgTime || 0)
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
