import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import { protect, adminOnly } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !adminOnly(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || '30';
        const limit = parseInt(searchParams.get('limit')) || 20;
        const days = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [quizStats, totalQuizzes, difficultyStats] = await Promise.all([
            QuizAttempt.aggregate([
                { $match: { attemptedAt: { $gte: startDate } } },
                { $group: { _id: '$quiz', totalAttempts: { $sum: 1 }, averageScore: { $avg: '$scorePercentage' } } },
                { $lookup: { from: 'quizzes', localField: '_id', foreignField: '_id', as: 'quizInfo' } },
                { $unwind: '$quizInfo' },
                { $project: { quizTitle: '$quizInfo.title', totalAttempts: 1, averageScore: { $round: ['$averageScore', 2] } } },
                { $sort: { totalAttempts: -1 } },
                { $limit: limit }
            ]),
            Quiz.countDocuments(),
            Quiz.aggregate([{ $group: { _id: '$difficulty', count: { $sum: 1 } } }])
        ]);

        return NextResponse.json({
            success: true,
            data: { period: `${days} days`, topQuizzes: quizStats, difficultyStats, overview: { totalQuizzes } }
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
