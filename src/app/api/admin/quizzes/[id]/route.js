import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import { protect, admin } from '@/middleware/auth';

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const data = await req.json();
        const { id } = params;

        const quiz = await Quiz.findByIdAndUpdate(id, data, { new: true });
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        return NextResponse.json({ message: '🎉 Quiz Updated Successfully!', quiz });
    } catch (error) {
        console.error('Admin update quiz error:', error);
        return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { id } = params;

        const quiz = await Quiz.findByIdAndDelete(id);
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        return NextResponse.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Admin delete quiz error:', error);
        return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
    }
}
