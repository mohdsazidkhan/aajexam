import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { notificationId } = await params;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return NextResponse.json({ success: false, message: 'Invalid notification ID' }, { status: 400 });
        }

        const notification = await Notification.findById(notificationId).populate('userId', 'name email');

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
