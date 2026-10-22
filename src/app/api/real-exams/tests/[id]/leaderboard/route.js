import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import { parsePaging, pagingMeta } from '@/lib/utils/pagination';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id: testId } = await params;
        const { searchParams } = new URL(req.url);
        const paging = parsePaging(searchParams, { defaultLimit: 20, maxLimit: 100, legacyCap: 20 });
        const { limit, skip } = paging;

        const filter = { practiceTest: new mongoose.Types.ObjectId(testId), status: 'Completed' };

        const [leaderboard, statsAgg] = await Promise.all([
            UserTestAttempt.find(filter)
                .populate('user', 'name username email')
                .sort({ score: -1, accuracy: -1, totalTime: 1, submittedAt: 1 })
                .skip(skip)
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

        // Ranks are derived at read time (ties share a rank) so they're always current;
        // submits no longer rewrite every attempt's stored rank.
        const totalN = statsAgg[0]?.totalParticipants || 0;
        if (leaderboard.length) {
            const f = leaderboard[0];
            const startRank = skip === 0 ? 1 : (await UserTestAttempt.countDocuments({
                ...filter,
                $or: [
                    { score: { $gt: f.score } },
                    { score: f.score, accuracy: { $gt: f.accuracy } },
                    { score: f.score, accuracy: f.accuracy, totalTime: { $lt: f.totalTime } },
                ],
            })) + 1;
            let prev = null, prevRank = startRank;
            leaderboard.forEach((row, i) => {
                const same = prev && prev.score === row.score && prev.accuracy === row.accuracy && prev.totalTime === row.totalTime;
                const rank = i === 0 ? startRank : (same ? prevRank : startRank + i);
                row.rank = rank;
                row.percentile = totalN > 1 ? Number((((totalN - rank) / (totalN - 1)) * 100).toFixed(2)) : 100;
                prev = row; prevRank = rank;
            });
        }

        const stats = statsAgg[0] || { totalParticipants: 0, topScore: 0, avgScore: 0, avgAccuracy: 0, avgTime: 0 };

        return NextResponse.json({
            success: true,
            data: leaderboard,
            count: leaderboard.length,
            ...(paging.paged ? { pagination: pagingMeta(paging, totalN) } : {}),
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
