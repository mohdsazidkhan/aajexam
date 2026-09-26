import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CommunityAnswer from '@/models/CommunityAnswer';
import CommunityQuestion from '@/models/CommunityQuestion';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';
import { createNotification } from '@/utils/notifications';

// Referenced only so their schemas are registered for populate() below.
void CommunityQuestion; void User;

// PUT - Approve/reject/hide a flagged community answer
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { id } = await params;
        const { status } = await req.json();

        if (!['approved', 'pending', 'rejected', 'hidden'].includes(status)) {
            return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
        }

        const update = { status };
        // Approving a reported answer clears the report queue for it.
        if (status === 'approved') {
            update.flaggedBy = [];
            update.flagCount = 0;
        }

        const answer = await CommunityAnswer.findByIdAndUpdate(id, update, { new: true })
            .populate('author', 'name username email')
            .populate('question', 'question');

        if (!answer) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        if (answer.author?._id) {
            const preview = (answer.body || '').slice(0, 80);
            const messages = {
                approved: { title: 'Your answer was approved', description: `Your answer "${preview}" is live and visible to everyone.` },
                rejected: { title: 'Your answer was rejected', description: `Your answer "${preview}" didn't meet our guidelines and was rejected.` },
                hidden: { title: 'Your answer was hidden', description: `Your answer "${preview}" was hidden by an admin for not meeting our guidelines.` }
            };
            if (messages[status]) {
                createNotification({
                    userId: answer.author._id,
                    type: 'announcement',
                    title: messages[status].title,
                    description: messages[status].description,
                    meta: { answerId: answer._id, questionId: answer.question?._id }
                });
            }
        }

        return NextResponse.json({ success: true, data: answer });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
