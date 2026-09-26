import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CommunityQuestion from '@/models/CommunityQuestion';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';
import { createNotification } from '@/utils/notifications';

// Referenced only so its schema is registered for populate('author') below.
void User;

// PUT - Approve/reject a community question
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { id } = await params;
        const { status } = await req.json();

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
        }

        const question = await CommunityQuestion.findByIdAndUpdate(id, { status }, { new: true })
            .populate('author', 'name username email');

        if (!question) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        if (question.author?._id && (status === 'approved' || status === 'rejected')) {
            const preview = (question.question || '').slice(0, 80);
            createNotification({
                userId: question.author._id,
                type: 'announcement',
                title: status === 'approved' ? 'Your question was approved' : 'Your question was rejected',
                description: status === 'approved'
                    ? `Your community question "${preview}" is now live.`
                    : `Your community question "${preview}" didn't meet our guidelines and was rejected.`,
                meta: { questionId: question._id }
            });
        }

        return NextResponse.json({ success: true, data: question });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
