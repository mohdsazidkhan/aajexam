import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CommunityQuestion from '@/models/CommunityQuestion';
import { protect, admin } from '@/middleware/auth';

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
        return NextResponse.json({ success: true, data: question });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
