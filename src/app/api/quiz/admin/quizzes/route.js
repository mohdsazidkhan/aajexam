import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import { protect, admin } from '@/middleware/auth';

// GET - list quizzes with filters & pagination
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const exam = searchParams.get('exam');
        const subject = searchParams.get('subject');
        const topic = searchParams.get('topic');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const filter = {};
        if (exam) filter.applicableExams = exam;
        if (subject) filter.subject = subject;
        if (topic) filter.topic = topic;
        if (status) filter.status = status;
        if (type) filter.type = type;

        const [quizzes, total] = await Promise.all([
            Quiz.find(filter)
                .populate('applicableExams', 'name code')
                .populate('subject', 'name')
                .populate('topic', 'name')
                .sort({ createdAt: -1 })
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

// POST - create quiz
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const body = await req.json();
        const { title, exam, applicableExams, subject, topic, questions, duration, marksPerQuestion, negativeMarking, difficulty, type, tags, isFree } = body;

        // Accept either a single `exam` (legacy clients) or `applicableExams` array.
        const examIds = Array.isArray(applicableExams) && applicableExams.length
            ? applicableExams
            : (exam ? [exam] : []);

        if (!title || !examIds.length || !subject || !duration) {
            return NextResponse.json({ message: 'title, applicableExams (or exam), subject, and duration are required' }, { status: 400 });
        }

        // validate that all question IDs exist
        if (questions?.length) {
            const existingCount = await Question.countDocuments({ _id: { $in: questions }, isActive: true });
            if (existingCount !== questions.length) {
                return NextResponse.json({ message: 'Some question IDs are invalid or inactive' }, { status: 400 });
            }
        }

        const mPerQ = marksPerQuestion || 1;
        const totalMarks = (questions?.length || 0) * mPerQ;

        const quiz = await Quiz.create({
            title, applicableExams: examIds, subject, topic, questions: questions || [],
            duration, totalMarks, marksPerQuestion: mPerQ, negativeMarking: negativeMarking || 0,
            difficulty: difficulty || 'mixed', type: type || 'topic_practice',
            tags: tags || [], isFree: isFree !== false,
            status: 'draft',
            createdBy: auth.user._id
        });

        return NextResponse.json({ success: true, data: quiz }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
