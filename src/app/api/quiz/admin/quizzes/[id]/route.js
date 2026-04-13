import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import { protect, admin } from '@/middleware/auth';

// GET - single quiz with populated questions
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const quiz = await Quiz.findById(id)
            .populate('exam', 'name code')
            .populate('subject', 'name')
            .populate('topic', 'name')
            .populate('questions');
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: quiz });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - update quiz
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const body = await req.json();

        // validate questions if being updated
        if (body.questions?.length) {
            const existingCount = await Question.countDocuments({ _id: { $in: body.questions }, isActive: true });
            if (existingCount !== body.questions.length) {
                return NextResponse.json({ message: 'Some question IDs are invalid or inactive' }, { status: 400 });
            }
            // recalculate totalMarks
            const quiz = await Quiz.findById(id);
            if (quiz) {
                body.totalMarks = body.questions.length * (body.marksPerQuestion || quiz.marksPerQuestion || 1);
            }
        }

        const quiz = await Quiz.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: quiz });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - soft delete (archive)
export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const quiz = await Quiz.findByIdAndUpdate(id, { status: 'archived' }, { new: true });
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Quiz archived' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
