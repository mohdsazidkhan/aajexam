import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import mongoose from 'mongoose';

// GET /api/air?examId=optional&limit=50
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const examId = searchParams.get('examId');
        const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100);

        const pipeline = [
            {
                $match: {
                    status: 'Completed'
                }
            }
        ];

        // If examId is provided, filter attempts for that specific exam
        if (examId) {
            pipeline.push(
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

        // Grouping
        pipeline.push(
            {
                $group: {
                    _id: '$user',
                    totalExams: { $sum: 1 },
                    avgAccuracy: { $avg: '$accuracy' },
                    totalScore: { $sum: '$score' },
                    bestScore: { $max: '$score' },
                }
            },
            {
                $match: { totalExams: { $gte: 1 } }
            },
            {
                // Rank by highest average accuracy, then total exams, then total score
                $sort: { avgAccuracy: -1, totalExams: -1, totalScore: -1 }
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
                    subscriptionStatus: '$user.subscriptionStatus',
                    totalExams: 1,
                    // Mapping accuracy to avgPercentage to keep the shared UI components working
                    avgPercentage: { $round: ['$avgAccuracy', 1] },
                    avgAccuracy: { $round: ['$avgAccuracy', 1] },
                    totalScore: { $round: ['$totalScore', 1] },
                    bestScore: { $round: ['$bestScore', 1] },
                    currentStreak: { $ifNull: ['$streak.currentStreak', 0] },
                    longestStreak: { $ifNull: ['$streak.longestStreak', 0] },
                }
            }
        );

        const leaderboard = await UserTestAttempt.aggregate(pipeline);

        // Add rank numbers
        const ranked = leaderboard.map((entry, idx) => ({
            rank: idx + 1,
            ...entry,
        }));

        return NextResponse.json({ success: true, data: ranked, examId });
    } catch (error) {
        console.error('AIR API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
