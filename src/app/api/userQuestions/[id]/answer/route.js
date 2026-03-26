import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import { protect } from '@/middleware/auth';

export async function POST(req, context) {
    try {
        await dbConnect();

        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        const params = await context.params;
        const id = params.id;

        const userId = auth.user._id || auth.user.id;
        const { selectedOptionIndex } = await req.json();

        if (typeof selectedOptionIndex !== 'number' || selectedOptionIndex < 0 || selectedOptionIndex > 3) {
            return NextResponse.json({ message: 'selectedOptionIndex must be 0-3' }, { status: 400 });
        }

        const question = await UserQuestions.findById(id);
        if (!question) return NextResponse.json({ message: 'Question not found' }, { status: 404 });

        const alreadyAnswered = question.answers.some(a => String(a.userId) === String(userId));
        if (alreadyAnswered) return NextResponse.json({ message: 'Already answered' }, { status: 409 });

        question.answers.push({ userId, selectedOptionIndex, answeredAt: new Date() });
        await question.save();

        return NextResponse.json({ success: true, data: { answered: true } });
    } catch (err) {
        console.error('answerQuestion error:', err);
        return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
    }
}
