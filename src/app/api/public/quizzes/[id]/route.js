import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const quiz = await Quiz.findById(id).select('-questions.correctAnswerIndex').populate('category', 'name').populate('subcategory', 'name').lean();
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: quiz });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
