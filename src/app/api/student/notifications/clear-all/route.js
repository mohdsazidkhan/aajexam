import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { protect } from '@/middleware/auth';

export async function DELETE(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await Notification.deleteMany({ userId: auth.user.id });
        
        return NextResponse.json({ 
            success: true, 
            message: 'All notifications cleared successfully' 
        });
    } catch (error) {
        console.error('DELETE /api/student/notifications/clear-all error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Support POST as well if frontend uses it
export async function POST(req) {
    return DELETE(req);
}
