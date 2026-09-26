import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

// POST - Send an announcement notification to a segment of users
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { title, description, target } = await req.json();

        const trimmedTitle = (title || '').trim();
        const trimmedDescription = (description || '').trim();
        if (!trimmedTitle || !trimmedDescription) {
            return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
        }
        if (!['all', 'pro', 'free'].includes(target)) {
            return NextResponse.json({ success: false, message: 'Invalid target' }, { status: 400 });
        }

        const query = { role: 'student' };
        if (target === 'pro') query.subscriptionStatus = 'PRO';
        if (target === 'free') query.subscriptionStatus = 'FREE';

        const users = await User.find(query).select('_id').lean();
        if (users.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'No matching users to notify' });
        }

        const docs = users.map((u) => ({
            userId: u._id,
            type: 'announcement',
            title: trimmedTitle.slice(0, 200),
            description: trimmedDescription.slice(0, 500),
            meta: { sentBy: auth.user._id, target }
        }));

        await Notification.insertMany(docs, { ordered: false });

        return NextResponse.json({ success: true, count: docs.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
