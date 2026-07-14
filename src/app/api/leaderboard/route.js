import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';
import UserStreak from '@/models/UserStreak';
import mongoose from 'mongoose';

// GET /api/leaderboard?type=quiz|exam&period=all-time|weekly|monthly&limit=50
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'quiz'; // 'quiz' or 'exam'
        const period = searchParams.get('period') || 'all-time';
        const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100);

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
        
        // Define groupings based on model differences
        const groupStage = type === 'exam' ? {
            _id: '$user',
            totalQuizzes: { $sum: 1 },
            avgPercentage: { $avg: '$accuracy' }, // UserTestAttempt lacks 'percentage', fallback to accuracy
            avgAccuracy: { $avg: '$accuracy' },
            totalScore: { $sum: '$score' },
            bestScore: { $max: '$score' },
        } : {
            _id: '$user',
            totalQuizzes: { $sum: 1 },
            avgPercentage: { $avg: '$percentage' },
            avgAccuracy: { $avg: '$accuracy' },
            totalScore: { $sum: '$score' },
            bestScore: { $max: '$percentage' },
        };

        // Aggregate attempts grouped by user
        const leaderboard = await Model.aggregate([
            {
                $match: {
                    status: 'Completed',
                    ...dateFilter,
                }
            },
            {
                $group: groupStage
            },
            {
                $match: { totalQuizzes: { $gte: 1 } }
            },
            {
                $sort: { avgPercentage: -1, avgAccuracy: -1, totalQuizzes: -1 }
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
                    bestScore: { $round: ['$bestScore', 1] },
                    currentStreak: { $ifNull: ['$streak.currentStreak', 0] },
                    longestStreak: { $ifNull: ['$streak.longestStreak', 0] },
                }
            }
        ]);

        // Add rank numbers
        const ranked = leaderboard.map((entry, idx) => ({
            rank: idx + 1,
            ...entry,
        }));

        return NextResponse.json({ success: true, data: ranked, period, type });
    } catch (error) {
        console.error('Leaderboard API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
