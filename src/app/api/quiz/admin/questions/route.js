import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';
import { protect, admin } from '@/middleware/auth';

// GET - list questions with filters & pagination
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const exam = searchParams.get('exam');
        const subject = searchParams.get('subject');
        const topic = searchParams.get('topic');
        const difficulty = searchParams.get('difficulty');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const filter = { isActive: true };
        if (exam) filter.exam = exam;
        if (subject) filter.subject = subject;
        if (topic) filter.topic = topic;
        if (difficulty) filter.difficulty = difficulty;
        if (search) filter.questionText = { $regex: search, $options: 'i' };

        const [questions, total] = await Promise.all([
            Question.find(filter)
                .populate('exam', 'name code')
                .populate('subject', 'name')
                .populate('topic', 'name')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Question.countDocuments(filter)
        ]);

        return NextResponse.json({
            success: true,
            data: questions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - create single question
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const body = await req.json();

        // bulk create support
        if (Array.isArray(body.questions)) {
            const questions = body.questions.map(q => ({ ...q, createdBy: auth.user._id }));
            const created = await Question.insertMany(questions);
            return NextResponse.json({ success: true, data: created, count: created.length }, { status: 201 });
        }

        const { exam, subject, topic, questionText, options, explanation, difficulty, tags, language, image } = body;
        if (!exam || !subject || !topic || !questionText || !options?.length) {
            return NextResponse.json({ message: 'exam, subject, topic, questionText, and options are required' }, { status: 400 });
        }

        const hasCorrect = options.some(o => o.isCorrect);
        if (!hasCorrect) return NextResponse.json({ message: 'At least one option must be marked as correct' }, { status: 400 });

        const question = await Question.create({
            exam, subject, topic, questionText, options, explanation, difficulty, tags, language, image,
            createdBy: auth.user._id
        });
        return NextResponse.json({ success: true, data: question }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
