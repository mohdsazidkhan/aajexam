import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const userId = auth.user.id;
        // Aggregation pipelines don't auto-cast strings to ObjectId the way
        // find()/countDocuments() do, so this must be cast explicitly.
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Fetch only the performanceMetrics and primaryTargetExam fields for maximum speed
        const [user, quizzesAttempted, quizTimeAgg, examTimeAgg] = await Promise.all([
            User.findById(userId)
                .select('performanceMetrics.examStats primaryTargetExam name')
                .lean(),
            QuizAttempt.countDocuments({ user: userId, status: 'Completed' }),
            // QuizAttempt.totalTime is stored in seconds.
            QuizAttempt.aggregate([
                { $match: { user: userObjectId, status: 'Completed' } },
                { $group: { _id: null, totalSeconds: { $sum: '$totalTime' } } }
            ]),
            // UserTestAttempt.totalTime is stored in milliseconds.
            UserTestAttempt.aggregate([
                { $match: { user: userObjectId, status: 'Completed' } },
                { $group: { _id: null, totalMs: { $sum: '$totalTime' } } }
            ]),
        ]);

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const quizTimeSpentSeconds = quizTimeAgg[0]?.totalSeconds || 0;
        const examTimeSpentSeconds = Math.round((examTimeAgg[0]?.totalMs || 0) / 1000);

        return NextResponse.json({
            success: true,
            data: {
                name: user.name,
                primaryTargetExam: user.primaryTargetExam,
                performanceMetrics: user.performanceMetrics,
                quizzesAttempted,
                quizTimeSpentSeconds,
                examTimeSpentSeconds,
                totalTimeSpentSeconds: quizTimeSpentSeconds + examTimeSpentSeconds,
                legacyProgress: {}
            }
        });

    } catch (error) {
        console.error('Analytics Report API Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch analytics report' 
        }, { status: 500 });
    }
}
