import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import { protect, admin } from '@/middleware/auth';

// PATCH - publish or unpublish a quiz
export async function PATCH(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const quiz = await Quiz.findById(id);
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        if (quiz.status === 'published') {
            // unpublish -> draft
            quiz.status = 'draft';
            quiz.publishedAt = null;
        } else {
            // publish
            if (!quiz.questions.length) {
                return NextResponse.json({ message: 'Cannot publish a quiz with no questions' }, { status: 400 });
            }
            quiz.status = 'published';
            quiz.publishedAt = new Date();
        }

        await quiz.save();
        return NextResponse.json({ success: true, data: quiz });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
