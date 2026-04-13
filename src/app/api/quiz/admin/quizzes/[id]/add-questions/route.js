import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import { protect, admin } from '@/middleware/auth';

// PATCH - add questions to a quiz
export async function PATCH(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const { questionIds } = await req.json();

        if (!questionIds?.length) return NextResponse.json({ message: 'questionIds array is required' }, { status: 400 });

        // validate question IDs
        const existingCount = await Question.countDocuments({ _id: { $in: questionIds }, isActive: true });
        if (existingCount !== questionIds.length) {
            return NextResponse.json({ message: 'Some question IDs are invalid or inactive' }, { status: 400 });
        }

        const quiz = await Quiz.findById(id);
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        // add only new questions (avoid duplicates)
        const existingIds = new Set(quiz.questions.map(q => q.toString()));
        const newIds = questionIds.filter(qId => !existingIds.has(qId));
        quiz.questions.push(...newIds);
        quiz.totalMarks = quiz.questions.length * quiz.marksPerQuestion;
        await quiz.save();

        return NextResponse.json({ success: true, data: quiz, added: newIds.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
