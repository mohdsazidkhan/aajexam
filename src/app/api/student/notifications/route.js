import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100);
        const unread = searchParams.get('unread') === 'true' || searchParams.get('unread') === '1';
        const skip = (page - 1) * limit;

        // Most notification types are internal admin activity-log entries (e.g.
        // "user X registered", "user X submitted a quiz") that happen to be
        // stored with userId = the acting user for the admin feed's benefit —
        // they were never meant to be shown back to that same user. The only
        // type genuinely addressed to the student is an admin-sent announcement.
        const filter = { userId: auth.user.id, type: 'announcement' };
        if (unread) filter.isRead = false;

        const [items, total] = await Promise.all([
            Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Notification.countDocuments(filter)
        ]);

        const enhancedItems = items.map(n => ({
            ...n,
            read: n.isRead // Frontend parity
        }));

        return NextResponse.json({
            success: true,
            data: enhancedItems,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('GET /api/student/notifications error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Scoped to 'announcement' so this never deletes the admin-facing
        // activity-log entries that happen to share this user's id (see GET above).
        await Notification.deleteMany({ userId: auth.user.id, type: 'announcement' });

        return NextResponse.json({
            success: true,
            message: 'All notifications cleared successfully'
        });
    } catch (error) {
        console.error('DELETE /api/student/notifications error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
