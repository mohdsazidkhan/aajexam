import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorProfile from '@/models/MentorProfile';
import { protect, admin } from '@/middleware/auth';
import { createNotification } from '@/utils/notifications';

// GET - Full mentor profile detail
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { id } = await params;

        const mentor = await MentorProfile.findById(id)
            .populate('user', 'name email username phone createdAt')
            .populate('verifiedBy', 'name email')
            .populate('amaThreads.askedBy', 'name username')
            .lean();

        if (!mentor) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: mentor });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

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

        if (status && mentor.user?._id) {
            const messages = {
                active: { title: 'Your mentor application was approved', description: 'Congratulations! You are now a mentor on AajExam. Students can now book AMA sessions with you.' },
                rejected: { title: 'Your mentor application was rejected', description: 'Your mentor application didn\'t meet our requirements this time.' },
                suspended: { title: 'Your mentor account was suspended', description: 'Your mentor account has been suspended by an admin.' }
            };
            if (messages[status]) {
                createNotification({
                    userId: mentor.user._id,
                    type: 'announcement',
                    title: messages[status].title,
                    description: messages[status].description,
                    meta: { mentorProfileId: mentor._id }
                });
            }
        }

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
        const mentor = await MentorProfile.findByIdAndDelete(id);

        if (mentor?.user) {
            createNotification({
                userId: mentor.user,
                type: 'announcement',
                title: 'Your mentor profile was removed',
                description: 'Your mentor profile was removed by an admin.',
                meta: { mentorProfileId: mentor._id }
            });
        }

        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
