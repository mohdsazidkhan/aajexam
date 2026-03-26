import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';
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

        const question = await Question.findByIdAndUpdate(id, data, { new: true });
        if (!question) return NextResponse.json({ message: 'Question not found' }, { status: 404 });

        return NextResponse.json({ message: '🎉 Question Updated Successfully!', question });
    } catch (error) {
        console.error('Admin update question error:', error);
        return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
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

        const question = await Question.findByIdAndDelete(id);
        if (!question) return NextResponse.json({ message: 'Question not found' }, { status: 404 });

        return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Admin delete question error:', error);
        return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
    }
}
