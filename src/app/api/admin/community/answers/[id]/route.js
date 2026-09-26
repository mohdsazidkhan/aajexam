import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CommunityAnswer from '@/models/CommunityAnswer';
import { protect, admin } from '@/middleware/auth';

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
        return NextResponse.json({ success: true, data: answer });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
