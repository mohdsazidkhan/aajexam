import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();

        // Optional authentication to match legacy behavior
        let currentUserId = null;
        try {
            const auth = await protect(req);
            if (auth.authenticated && auth.user) {
                currentUserId = auth.user.id;
            }
        } catch (e) {
            // Ignore auth errors, public is allowed
        }

        // Ensure parameters are resolved
        const { quizId } = await params;

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return NextResponse.json({ success: false, message: 'Quiz not found' }, { status: 404 });
        }

        const attempts = await QuizAttempt.find({ quiz: quizId })
            .populate('user', 'name')
            .sort({ scorePercentage: -1, attemptedAt: 1 })
            .skip(skip)
            .limit(limit);

        const total = await QuizAttempt.countDocuments({ quiz: quizId });

        const leaderboard = attempts.map((attempt, index) => ({
            rank: skip + index + 1,
            studentId: attempt.user?._id,
            studentName: attempt.user?.name || 'Anonymous',
            score: attempt.scorePercentage,
            attemptedAt: attempt.attemptedAt,
            totalQuestions: attempt.score + (attempt.answers?.filter(a => a.answer === 'SKIP').length || 0),
            correctAnswers: attempt.score,
            isBestScore: attempt.isBestScore
        }));

        return NextResponse.json({
            success: true,
            leaderboard,
            quiz: {
                id: quiz._id,
                title: quiz.title,
                description: quiz.description
            },
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalAttempts: total,
                hasNextPage: skip + attempts.length < total,
                hasPrevPage: page > 1
            }
        });

    } catch (err) {
        console.error('Quiz leaderboard fetch error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
