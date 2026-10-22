import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import mongoose from 'mongoose';
import { readCache, writeCache } from '@/lib/utils/sharedCache';
import { statsReady, topLifetime, examScopeTotals } from '@/lib/utils/leaderboardStats';

// This ranks every completed attempt on the platform (several full scans), so the result is
// cached (shared across server instances) per (examId, limit) instead of recomputed per request.
const CACHE_TTL_SEC = 5 * 60;

// GET /api/air?examId=optional&limit=20
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const examId = searchParams.get('examId');
        const limit = Math.min(Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 200), 100);

        const cacheKey = `${examId || 'all'}:${limit}`;
        const useStats = await statsReady();
        const hit = await readCache(`air:${useStats ? 's:' : ''}${cacheKey}`);
        if (hit) return NextResponse.json(hit);

        // Precomputed path (after the stats backfill): per-exam lifetime rows are index-ordered,
        // so no attempt scan at all.
        if (useStats) {
            const scope = examId || 'all';
            const [rows, totals] = await Promise.all([
                topLifetime({ kind: 'exam', scope, pool: limit, countKey: 'totalExams' }),
                examScopeTotals(scope),
            ]);
            const body = {
                success: true,
                data: rows.map((entry, idx) => ({ rank: idx + 1, ...entry })),
                examId,
                totalAttempts: totals.attempts,
                totalUsers: totals.users,
                totalTimeSpentSeconds: Math.round(totals.time / 1000),
            };
            await writeCache(`air:s:${cacheKey}`, body, CACHE_TTL_SEC);
            return NextResponse.json(body);
        }

        // Stages shared between the leaderboard pipeline and the total-attempts
        // count below, so both respect the same "Completed" + optional examId filter.
        const preGroupStages = [
            {
                $match: {
                    status: 'Completed'
                }
            }
        ];

        // If examId is provided, filter attempts for that specific exam
        if (examId) {
            preGroupStages.push(
                {
                    $lookup: {
                        from: 'practicetests',
                        localField: 'practiceTest',
                        foreignField: '_id',
                        as: 'testDoc'
                    }
                },
                { $unwind: { path: '$testDoc', preserveNullAndEmptyArrays: false } },
                {
                    $lookup: {
                        from: 'exampatterns',
                        localField: 'testDoc.examPattern',
                        foreignField: '_id',
                        as: 'patternDoc'
                    }
                },
                { $unwind: { path: '$patternDoc', preserveNullAndEmptyArrays: false } },
                {
                    $match: {
                        'patternDoc.exam': new mongoose.Types.ObjectId(examId)
                    }
                }
            );
        }

        const pipeline = [...preGroupStages];

        // Join each attempt's PracticeTest so we can sum real max-marks per
        // user (UserTestAttempt itself has no totalMarks field).
        pipeline.push(
            {
                $lookup: {
                    from: 'practicetests',
                    localField: 'practiceTest',
                    foreignField: '_id',
                    as: 'practiceTestDoc'
                }
            },
            { $unwind: { path: '$practiceTestDoc', preserveNullAndEmptyArrays: true } },
            { $addFields: { practiceTestMarks: { $ifNull: ['$practiceTestDoc.totalMarks', 0] } } }
        );

        // Grouping
        pipeline.push(
            {
                $group: {
                    _id: '$user',
                    totalExams: { $sum: 1 },
                    avgAccuracy: { $avg: '$accuracy' },
                    totalScore: { $sum: '$score' },
                    totalMarks: { $sum: '$practiceTestMarks' },
                    totalCorrect: { $sum: '$correctCount' },
                    totalTimeSpent: { $sum: '$totalTime' },
                    bestScore: { $max: '$score' },
                }
            },
            {
                $match: { totalExams: { $gte: 1 } }
            },
            {
                // Rank by: most exams attempted, then accuracy, then total score.
                $sort: { totalTimeSpent: -1, totalExams: -1, avgAccuracy: -1, totalScore: -1, _id: 1 }
            },
            { $limit: limit },
            // Join User data
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
            // Only active users
            {
                $match: { 'user.status': 'active' }
            },
            // Join streak data for UI consistency
            {
                $lookup: {
                    from: 'userstreaks',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'streak'
                }
            },
            {
                $unwind: { path: '$streak', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    name: '$user.name',
                    username: '$user.username',
                    profilePicture: '$user.profilePicture',
                    city: '$user.city',
                    subscriptionStatus: '$user.subscriptionStatus',
                    totalExams: 1,
                    // Mapping accuracy to avgPercentage to keep the shared UI components working
                    avgPercentage: { $round: ['$avgAccuracy', 1] },
                    avgAccuracy: { $round: ['$avgAccuracy', 1] },
                    totalScore: { $round: ['$totalScore', 1] },
                    totalMarks: { $ifNull: ['$totalMarks', 0] },
                    totalCorrect: { $ifNull: ['$totalCorrect', 0] },
                    totalTimeSpent: { $ifNull: ['$totalTimeSpent', 0] },
                    bestScore: { $round: ['$bestScore', 1] },
                    currentStreak: { $ifNull: ['$streak.currentStreak', 0] },
                    longestStreak: { $ifNull: ['$streak.longestStreak', 0] },
                }
            }
        );

        const [leaderboard, totalAttemptsResult, rankedUsersResult, totalTimeResult] = await Promise.all([
            UserTestAttempt.aggregate(pipeline),
            UserTestAttempt.aggregate([...preGroupStages, { $count: 'total' }]),
            // "Ranked Users" = distinct users with at least one matching completed
            // attempt (not the whole platform's user count) — same scope as above.
            UserTestAttempt.aggregate([...preGroupStages, { $group: { _id: '$user' } }, { $count: 'total' }]),
            // Platform-wide total across every matching attempt, not just the
            // top `limit` shown — same "Completed" + optional examId scope.
            UserTestAttempt.aggregate([...preGroupStages, { $group: { _id: null, totalMs: { $sum: '$totalTime' } } }]),
        ]);

        // Add rank numbers
        const ranked = leaderboard.map((entry, idx) => ({
            rank: idx + 1,
            ...entry,
        }));

        const body = {
            success: true,
            data: ranked,
            examId,
            totalAttempts: totalAttemptsResult[0]?.total || 0,
            totalUsers: rankedUsersResult[0]?.total || 0,
            totalTimeSpentSeconds: Math.round((totalTimeResult[0]?.totalMs || 0) / 1000),
        };
        await writeCache(`air:${cacheKey}`, body, CACHE_TTL_SEC);
        return NextResponse.json(body);
    } catch (error) {
        console.error('AIR API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
