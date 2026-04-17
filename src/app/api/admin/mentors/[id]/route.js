import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorProfile from '@/models/MentorProfile';
import { protect, admin } from '@/middleware/auth';

// PUT - Approve/reject/suspend mentor
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { id } = await params;
        const { status, isVerified } = await req.json();

        const update = {};
        if (status) update.status = status;
        if (isVerified !== undefined) {
            update.isVerified = isVerified;
            if (isVerified) {
                update.verifiedBy = auth.user._id;
                update.verifiedAt = new Date();
            }
        }

        const mentor = await MentorProfile.findByIdAndUpdate(id, update, { new: true })
            .populate('user', 'name email username');

        if (!mentor) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: mentor });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Remove mentor profile
export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { id } = await params;
        await MentorProfile.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
