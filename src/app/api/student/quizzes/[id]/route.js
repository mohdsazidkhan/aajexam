import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Question from '@/models/Question';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const quiz = await Quiz.findById(id)
            .populate('category', 'name')
            .populate('subcategory', 'name');

        if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

        const questions = await Question.find({ quiz: id });

        if (!questions.length) {
            return NextResponse.json({ error: 'No questions found for this quiz' }, { status: 404 });
        }

        return NextResponse.json({
            ...quiz.toObject(),
            questions
        });
    } catch (err) {
        console.error('Quiz fetch error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
