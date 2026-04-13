import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';

// GET - public: list published quizzes with filters
export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const exam = searchParams.get('exam');
        const subject = searchParams.get('subject');
        const topic = searchParams.get('topic');
        const type = searchParams.get('type');
        const difficulty = searchParams.get('difficulty');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const filter = { status: 'published' };
        if (exam) filter.exam = exam;
        if (subject) filter.subject = subject;
        if (topic) filter.topic = topic;
        if (type) filter.type = type;
        if (difficulty) filter.difficulty = difficulty;

        const [quizzes, total] = await Promise.all([
            Quiz.find(filter)
                .populate('exam', 'name code')
                .populate('subject', 'name')
                .populate('topic', 'name')
                .select('-questions')
                .sort({ publishedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Quiz.countDocuments(filter)
        ]);

        return NextResponse.json({
            success: true,
            data: quizzes,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
