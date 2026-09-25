import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';
import UserStreak from '@/models/UserStreak';
import { protect, admin } from '@/middleware/auth';

// GET /api/admin/leaderboard?type=quiz|exam&period=all-time|weekly|monthly&page=1&limit=20&search=
// Admin-only mirror of /api/leaderboard — same ranking pipeline, but paginated
// and searchable instead of capped at a "top N" list, since admins need to
// look up any user's platform-wide rank, not just the top of the board.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'quiz'; // 'quiz' or 'exam'
        const period = searchParams.get('period') || 'all-time';
        const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);
        const limit = Math.min(parseInt(searchParams.get('limit'), 10) || 20, 100);
        const search = (searchParams.get('search') || '').trim();

        let dateFilter = {};
        const now = new Date();
        if (period === 'weekly') {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            dateFilter = { createdAt: { $gte: weekAgo } };
        } else if (period === 'monthly') {
            const monthAgo = new Date(now);
            monthAgo.setDate(monthAgo.getDate() - 30);
            dateFilter = { createdAt: { $gte: monthAgo } };
        }

        const Model = type === 'exam' ? UserTestAttempt : QuizAttempt;

        const groupStage = type === 'exam' ? {
            _id: '$user',
            totalQuizzes: { $sum: 1 },
            avgPercentage: { $avg: '$accuracy' },
            avgAccuracy: { $avg: '$accuracy' },
            totalScore: { $sum: '$score' },
            totalMarks: { $sum: '$practiceTestMarks' },
            totalCorrect: { $sum: '$correctCount' },
            bestScore: { $max: '$score' },
        } : {
            _id: '$user',
            totalQuizzes: { $sum: 1 },
            avgPercentage: { $avg: '$percentage' },
            avgAccuracy: { $avg: '$accuracy' },
            totalScore: { $sum: '$score' },
            totalMarks: { $sum: '$totalMarks' },
            totalCorrect: { $sum: '$correctCount' },
            bestScore: { $max: '$percentage' },
        };

        const examMarksLookupStages = type === 'exam' ? [
            {
                $lookup: {
                    from: 'practicetests',
                    localField: 'practiceTest',
                    foreignField: '_id',
                    as: 'practiceTestDoc'
                }
            },
            { $unwind: { path: '$practiceTestDoc', preserveNullAndEmptyArrays: true } },
            { $addFields: { practiceTestMarks: { $ifNull: ['$practiceTestDoc.totalMarks', 0] } } },
        ] : [];

        const leaderboard = await Model.aggregate([
            {
                $match: {
                    status: 'Completed',
                    ...dateFilter,
                }
            },
            ...examMarksLookupStages,
            { $group: groupStage },
            { $match: { totalQuizzes: { $gte: 1 } } },
            { $sort: { avgAccuracy: -1, avgPercentage: -1, totalQuizzes: -1 } },
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
                    subscriptionStatus: '$user.subscriptionStatus',
                    totalQuizzes: 1,
                    avgPercentage: { $round: ['$avgPercentage', 1] },
                    avgAccuracy: { $round: ['$avgAccuracy', 1] },
                    totalScore: { $round: ['$totalScore', 1] },
                    totalMarks: { $ifNull: ['$totalMarks', 0] },
                    totalCorrect: { $ifNull: ['$totalCorrect', 0] },
                    bestScore: { $round: ['$bestScore', 1] },
                    currentStreak: { $ifNull: ['$streak.currentStreak', 0] },
                    longestStreak: { $ifNull: ['$streak.longestStreak', 0] },
                }
            }
        ]);

        // Rank across the full platform-wide pool first, so a searched-for
        // user still shows their true rank, not their position within the
        // filtered/paginated slice.
        let ranked = leaderboard.map((entry, idx) => ({ rank: idx + 1, ...entry }));

        if (search) {
            const term = search.toLowerCase();
            ranked = ranked.filter((entry) =>
                entry.name?.toLowerCase().includes(term) ||
                entry.username?.toLowerCase().includes(term) ||
                entry.email?.toLowerCase().includes(term)
            );
        }

        const total = ranked.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const paged = ranked.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
            success: true,
            data: paged,
            period,
            type,
            pagination: { page, limit, total, totalPages },
        });
    } catch (error) {
        console.error('Admin leaderboard API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
