import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';

// GET - public: single quiz detail (without correct answers)
export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const quiz = await Quiz.findOne({ _id: id, status: 'published' })
            .populate('exam', 'name code')
            .populate('subject', 'name')
            .populate('topic', 'name')
            .populate({
                path: 'questions',
                match: { isActive: true },
                select: 'questionText options.text difficulty image'
            });

        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: quiz });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
