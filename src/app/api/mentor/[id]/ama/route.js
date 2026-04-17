import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorProfile from '@/models/MentorProfile';
import { protect } from '@/middleware/auth';

// GET - Get AMA threads for a mentor
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const mentor = await MentorProfile.findById(id)
            .populate('amaThreads.askedBy', 'name username profilePicture')
            .select('amaThreads');

        if (!mentor) return NextResponse.json({ message: 'Mentor not found' }, { status: 404 });

        const sortedThreads = mentor.amaThreads.sort((a, b) => b.upvotes - a.upvotes);
        return NextResponse.json({ success: true, data: sortedThreads });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Ask a question in AMA
export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();
        const { id } = await params;
        const { question } = await req.json();

        if (!question || question.trim().length === 0) {
            return NextResponse.json({ message: 'Question required' }, { status: 400 });
        }

        const mentor = await MentorProfile.findById(id);
        if (!mentor || mentor.status !== 'active') {
            return NextResponse.json({ message: 'Mentor not found or inactive' }, { status: 404 });
        }

        mentor.amaThreads.push({
            question: question.trim(),
            answer: '',
            askedBy: auth.user._id,
            askedAt: new Date()
        });

        await mentor.save();

        return NextResponse.json({ success: true, message: 'Question submitted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - Answer a question (mentor only)
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();
        const { id } = await params;
        const { amaId, answer } = await req.json();

        const mentor = await MentorProfile.findOne({ _id: id, user: auth.user._id });
        if (!mentor) return NextResponse.json({ message: 'Not your mentor profile' }, { status: 403 });

        const thread = mentor.amaThreads.id(amaId);
        if (!thread) return NextResponse.json({ message: 'Question not found' }, { status: 404 });

        thread.answer = answer.trim();
        thread.answeredAt = new Date();
        mentor.helpedStudents += 1;

        await mentor.save();
        return NextResponse.json({ success: true, data: thread });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
