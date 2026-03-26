import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import UserQuestionLikes from '@/models/UserQuestionLikes';
import { protect } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function POST(req, context) {
    try {
        await dbConnect();

        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        const params = await context.params;
        const id = params.id;

        const userId = auth.user._id || auth.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
        }

        const question = await UserQuestions.findById(id).select('_id');
        if (!question) return NextResponse.json({ message: 'Question not found' }, { status: 404 });

        try {
            await UserQuestionLikes.create({ questionId: id, userId });
            await UserQuestions.updateOne({ _id: id }, { $inc: { likesCount: 1 } });
            return NextResponse.json({ success: true, data: { liked: true, firstTime: true } });
        } catch (e) {
            if (e && e.code === 11000) {
                return NextResponse.json({ success: true, data: { liked: true, firstTime: false } });
            }
            throw e;
        }
    } catch (err) {
        console.error('likeQuestion error:', err);
        return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
    }
}
