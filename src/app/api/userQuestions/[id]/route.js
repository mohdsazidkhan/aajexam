import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import { protect } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function GET(req, context) {
    try {
        await dbConnect();

        const params = await context.params;
        const id = params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid id' }, { status: 400 });

        const question = await UserQuestions.findById(id);
        if (!question) return NextResponse.json({ message: 'Question not found' }, { status: 404 });

        let viewerId = null;
        try {
            const auth = await protect(req);
            if (auth.authenticated && auth.user) {
                viewerId = auth.user._id || auth.user.id;
            }
        } catch (e) { }

        if (viewerId && String(question.userId) !== String(viewerId)) {
            await UserQuestions.updateOne({ _id: id }, { $inc: { viewsCount: 1 } });
        }

        if (question.status !== 'approved') {
            if (!viewerId || String(question.userId) !== String(viewerId)) {
                return NextResponse.json({ message: 'Not authorized to view this question' }, { status: 403 });
            }
        }

        return NextResponse.json({ success: true, data: question });
    } catch (err) {
        console.error('getQuestion error:', err);
        return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
    }
}
