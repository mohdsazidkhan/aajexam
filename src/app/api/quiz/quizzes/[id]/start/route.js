import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import { protect } from '@/middleware/auth';

// POST - start a quiz attempt
export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { id } = await params;
        const quiz = await Quiz.findOne({ _id: id, status: 'published' })
            .populate({
                path: 'questions',
                match: { isActive: true },
                select: 'questionText options.text difficulty image'
            });

        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        // check if user already has an in-progress attempt
        const existing = await QuizAttempt.findOne({ user: auth.user._id, quiz: id, status: 'InProgress' });
        if (existing) {
            return NextResponse.json({ success: true, data: existing, quiz, resumed: true });
        }

        const attempt = await QuizAttempt.create({
            user: auth.user._id,
            quiz: id,
            totalMarks: quiz.totalMarks,
            answers: quiz.questions.map(q => ({ question: q._id, selectedOptionIndex: -1, isCorrect: false, timeTaken: 0 }))
        });

        return NextResponse.json({ success: true, data: attempt, quiz }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
