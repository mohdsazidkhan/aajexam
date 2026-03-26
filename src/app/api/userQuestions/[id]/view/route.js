import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import UserQuestionViews from '@/models/UserQuestionViews';
import { protect } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function POST(req, context) {
    try {
        await dbConnect();

        const params = await context.params;
        const id = params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
        }

        let viewerId = null;
        try {
            const auth = await protect(req);
            if (auth.authenticated && auth.user) {
                viewerId = auth.user._id || auth.user.id;
            }
        } catch (e) {
            // Ignore auth error for public view increment
        }

        if (viewerId) {
            const q = await UserQuestions.findById(id).select('userId status');
            if (!q || q.status !== 'approved') return NextResponse.json({ message: 'Question not found' }, { status: 404 });

            if (String(q.userId) === String(viewerId)) {
                return NextResponse.json({ success: true, data: { viewed: false, reason: 'owner' } });
            }

            try {
                await UserQuestionViews.create({ questionId: id, userId: viewerId });
                await UserQuestions.updateOne({ _id: id }, { $inc: { viewsCount: 1 } });
                return NextResponse.json({ success: true, data: { viewed: true, firstTime: true } });
            } catch (e) {
                if (e && e.code === 11000) {
                    return NextResponse.json({ success: true, data: { viewed: true, firstTime: false } });
                }
                throw e;
            }
        } else {
            await UserQuestions.updateOne({ _id: id, status: 'approved' }, { $inc: { viewsCount: 1 } });
            return NextResponse.json({ success: true, data: { viewed: true, anonymous: true } });
        }
    } catch (err) {
        console.error('incrementView error:', err);
        return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
    }
}
