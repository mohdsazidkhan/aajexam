import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';
import { protect } from '@/middleware/auth';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { notificationId } = await params;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return NextResponse.json({ success: false, message: 'Invalid notification ID' }, { status: 400 });
        }

        // Scope to the caller's own notification so one user can't mark another's read.
        const updated = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: auth.user.id },
            { isRead: true }
        );
        if (!updated) {
            return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update notification',
            error: error.message
        }, { status: 500 });
    }
}
