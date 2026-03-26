import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        await dbConnect();
        const { id: quizid } = await params;

        const quizAttempt = await QuizAttempt.findOne({
            user: auth.user.id,
            quiz: quizid
        }).populate({
            path: 'quiz',
            populate: [
                { path: 'category', select: 'name' },
                { path: 'subcategory', select: 'name' }
            ]
        });

        if (!quizAttempt) {
            return NextResponse.json({ success: false, message: 'No quiz attempt found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                _id: quizAttempt._id,
                quizId: quizAttempt.quiz._id,
                quizTitle: quizAttempt.quiz.title,
                categoryName: quizAttempt.quiz.category?.name || 'Unknown',
                subcategoryName: quizAttempt.quiz.subcategory?.name || 'Unknown',
                score: quizAttempt.score,
                scorePercentage: quizAttempt.scorePercentage,
                attemptedAt: quizAttempt.attemptedAt,
                isHighScore: quizAttempt.isBestScore,
                rank: quizAttempt.rank || 0,
                totalQuestions: quizAttempt.answers?.length || 0
            }
        });
    } catch (err) {
        console.error('Quiz result error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
