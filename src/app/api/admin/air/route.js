import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import mongoose from 'mongoose';
import { protect, admin } from '@/middleware/auth';
import { readCache, writeCache } from '@/lib/utils/sharedCache';
import { normalizeRankSort, rowSort } from '@/lib/utils/rankSort';

// GET /api/admin/air?examId=optional&page=1&limit=20&search=&sort=time|attempts|correct|score|accuracy|avg
// Admin-only mirror of /api/air — same exam-attempt ranking pipeline, but
// paginated and searchable; like the student page it only covers the top 100 ranked students.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        // Full-collection ranking: identical for every admin tab, so serve a two-minute copy per query string.
        const __ck = `admin-air:${new URL(req.url).search}`;
        const __hit = await readCache(__ck);
        if (__hit) return NextResponse.json(__hit);
        const { searchParams } = new URL(req.url);
        const examId = searchParams.get('examId');
        const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);
        const limit = Math.min(Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 1000), 100);
        const search = (searchParams.get('search') || '').trim();
        const sort = normalizeRankSort(searchParams.get('sort'));

        const preGroupStages = [
            { $match: { status: 'Completed' } }
        ];

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
            { $match: { totalExams: { $gte: 1 } } },
            // Rank by: most exams attempted, then accuracy, then total score —
            // must match /api/air's sort exactly (this is meant to be the same
            // ranking pipeline, just paginated/searchable for admin use).
            { $sort: rowSort(sort) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
            { $match: { 'user.status': 'active' } },
            {
                $lookup: {
                    from: 'userstreaks',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'streak'
                }
            },
            { $unwind: { path: '$streak', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    name: '$user.name',
                    username: '$user.username',
                    email: '$user.email',
                    profilePicture: '$user.profilePicture',
                    city: '$user.city',
                    subscriptionStatus: '$user.subscriptionStatus',
                    totalExams: 1,
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

        const leaderboard = await UserTestAttempt.aggregate(pipeline);

        // Top 100 only (same board as the student page); search and paging work within it.
        let ranked = leaderboard.slice(0, 100).map((entry, idx) => ({ rank: idx + 1, ...entry }));

        if (search) {
            const term = search.toLowerCase();
            ranked = ranked.filter((entry) =>
                entry.name?.toLowerCase().includes(term) ||
                entry.username?.toLowerCase().includes(term) ||
                entry.email?.toLowerCase().includes(term) ||
                entry.city?.toLowerCase().includes(term)
            );
        }

        const total = ranked.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const paged = ranked.slice((page - 1) * limit, page * limit);

        const __body = {
            success: true,
            data: paged,
            examId,
            pagination: { page, limit, total, totalPages },
        };
        await writeCache(__ck, JSON.parse(JSON.stringify(__body)), 120);
        return NextResponse.json(__body);
    } catch (error) {
        console.error('Admin AIR API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
