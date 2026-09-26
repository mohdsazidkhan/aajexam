import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { protect } from '@/middleware/auth';

export async function PUT(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Scoped to 'announcement' — the other types are admin activity-log
        // entries that happen to share this user's id; marking them read here
        // would incorrectly clear them off the admin's unread feed too.
        await Notification.updateMany(
            { userId: auth.user.id, type: 'announcement', isRead: false },
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
