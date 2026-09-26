import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
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

        // Scope to the caller's own notification so one user can't read another's.
        const notification = await Notification.findOne({ _id: notificationId, userId: auth.user.id });

        if (!notification) {
            return NextResponse.json({
                success: false,
                message: 'Notification not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error fetching notification:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch notification',
            error: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
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

        // Scope to the caller's own notification so one user can't delete another's.
        const deleted = await Notification.findOneAndDelete({ _id: notificationId, userId: auth.user.id });
        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        }, { status: 500 });
    }
}
