import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';
import { protect, admin } from '@/middleware/auth';

// GET - single question
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const question = await Question.findById(id)
            .populate('exam', 'name code')
            .populate('subject', 'name')
            .populate('topic', 'name');
        if (!question) return NextResponse.json({ message: 'Question not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: question });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - update question
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const body = await req.json();

        if (body.options) {
            const hasCorrect = body.options.some(o => o.isCorrect);
            if (!hasCorrect) return NextResponse.json({ message: 'At least one option must be marked as correct' }, { status: 400 });
        }

        const question = await Question.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!question) return NextResponse.json({ message: 'Question not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: question });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - soft delete
export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const question = await Question.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!question) return NextResponse.json({ message: 'Question not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Question deactivated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
