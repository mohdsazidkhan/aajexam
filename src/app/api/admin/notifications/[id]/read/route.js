import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { protect, admin } from '@/middleware/auth';

export async function PATCH(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true }).lean();
        if (!notification) {
            return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
        }

        return NextResponse.json({ notification });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
