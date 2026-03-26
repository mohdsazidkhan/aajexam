import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { notificationId } = await params;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return NextResponse.json({ success: false, message: 'Invalid notification ID' }, { status: 400 });
        }

        await Notification.findByIdAndUpdate(notificationId, { isRead: true });

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
