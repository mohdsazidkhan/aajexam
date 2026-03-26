import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { protect } from '@/middleware/auth';

export async function PUT(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await Notification.updateMany(
            { userId: auth.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        return NextResponse.json({ 
            success: true, 
            message: 'All notifications marked as read' 
        });
    } catch (error) {
        console.error('PUT /api/student/notifications/mark-all-read error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Support POST as well if frontend uses it
export async function POST(req) {
    return PUT(req);
}
