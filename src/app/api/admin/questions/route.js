import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;
        const search = searchParams.get('search');
        const quiz = searchParams.get('quiz');

        let query = {};
        if (search && search.trim()) {
            query.questionText = new RegExp(search.trim(), 'i');
        }
        if (quiz) {
            query.quiz = quiz;
        }

        const questions = await Question.find(query)
            .populate('quiz', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Question.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            questions,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        console.error('Admin questions error:', error);
        return NextResponse.json({ error: 'Failed to get questions' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { quiz, questionText, options, correctAnswerIndex, timeLimit } = await req.json();

        if (!quiz || !questionText || !options || correctAnswerIndex === undefined) {
            return NextResponse.json({ error: 'Quiz, question text, options, and correct answer are required' }, { status: 400 });
        }

        const question = new Question({ quiz, questionText, options, correctAnswerIndex, timeLimit });
        await question.save();

        return NextResponse.json({ success: true, message: '🎉 Question Created Successfully!', question }, { status: 201 });
    } catch (error) {
        console.error('Admin create question error:', error);
        return NextResponse.json({ error: 'Failed to create question', details: error.message }, { status: 500 });
    }
}
