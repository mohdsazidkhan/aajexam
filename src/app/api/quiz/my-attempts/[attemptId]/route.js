import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import { protect } from '@/middleware/auth';

// GET - detailed result of a specific attempt (with correct answers for review)
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { attemptId } = await params;
        const attempt = await QuizAttempt.findOne({ _id: attemptId, user: auth.user._id })
            .populate({
                path: 'quiz',
                select: 'title applicableExams subject topic type difficulty duration totalMarks marksPerQuestion negativeMarking',
                populate: [
                    { path: 'applicableExams', select: 'name code' },
                    { path: 'subject', select: 'name' },
                    { path: 'topic', select: 'name' }
                ]
            })
            .populate({
                path: 'answers.question',
                select: 'questionText options explanation difficulty image'
            });

        if (!attempt) return NextResponse.json({ message: 'Attempt not found' }, { status: 404 });

        // only show correct answers if attempt is completed
        if (attempt.status !== 'Completed') {
            return NextResponse.json({ message: 'Attempt is not completed yet' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: attempt });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
