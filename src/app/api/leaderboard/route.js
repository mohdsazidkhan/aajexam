import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';
import UserStreak from '@/models/UserStreak';
import mongoose from 'mongoose';
import { protect } from '@/middleware/auth';

// GET /api/leaderboard?type=quiz|exam&period=all-time|weekly|monthly&limit=50
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'quiz'; // 'quiz' or 'exam'
        const period = searchParams.get('period') || 'all-time';
        const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100);

        const auth = await protect(req);
        const currentUserId = auth.authenticated ? auth.user._id.toString() : null;

        // Build date filter based on period
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

        // Define groupings based on model differences.
        // UserTestAttempt (exam) has no totalMarks of its own — each attempt's
        // real max marks live on its PracticeTest, joined in via the extra
        // $lookup/$unwind/$addFields stages below rather than left as 0.
        const groupStage = type === 'exam' ? {
            _id: '$user',
            totalQuizzes: { $sum: 1 },
            avgPercentage: { $avg: '$accuracy' }, // UserTestAttempt lacks 'percentage', fallback to accuracy
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

        // Aggregate attempts grouped by user
        const leaderboard = await Model.aggregate([
            {
                $match: {
                    status: 'Completed',
                    ...dateFilter,
                }
            },
            ...examMarksLookupStages,
            {
                $group: groupStage
            },
            {
                $match: { totalQuizzes: { $gte: 1 } }
            },
            {
                $sort: { avgAccuracy: -1, avgPercentage: -1, totalQuizzes: -1 }
            },
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
            // Join streak data
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
                    subscriptionStatus: '$user.subscriptionStatus',
                    totalQuizzes: 1, // Will rename to totalAttempts in UI if needed, kept as totalQuizzes for API consistency
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

        // Add rank numbers — computed across the full ranked pool so a user
        // outside the displayed top `limit` still gets their real rank.
        const ranked = leaderboard.map((entry, idx) => ({
            rank: idx + 1,
            ...entry,
        }));

        const myEntry = currentUserId
            ? ranked.find((e) => String(e.userId) === currentUserId) || null
            : null;

        return NextResponse.json({ success: true, data: ranked.slice(0, limit), period, type, myEntry });
    } catch (error) {
        console.error('Leaderboard API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
