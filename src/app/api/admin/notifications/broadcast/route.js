import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import Announcement from '@/models/Announcement';
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
        const { title, description, target, userIds } = await req.json();

        const trimmedTitle = (title || '').trim();
        const trimmedDescription = (description || '').trim();
        if (!trimmedTitle || !trimmedDescription) {
            return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
        }
        if (!['all', 'pro', 'free', 'users'].includes(target)) {
            return NextResponse.json({ success: false, message: 'Invalid target' }, { status: 400 });
        }

        const query = { role: 'student' };
        if (target === 'pro') query.subscriptionStatus = 'PRO';
        if (target === 'free') query.subscriptionStatus = 'FREE';
        if (target === 'users') {
            if (!Array.isArray(userIds) || userIds.length === 0) {
                return NextResponse.json({ success: false, message: 'Select at least one user' }, { status: 400 });
            }
            query._id = { $in: userIds };
        }

        const users = await User.find(query).select(target === 'users' ? '_id name email' : '_id').lean();

        const finalTitle = trimmedTitle.slice(0, 200);
        const finalDescription = trimmedDescription.slice(0, 500);

        if (users.length > 0) {
            const docs = users.map((u) => ({
                userId: u._id,
                type: 'announcement',
                title: finalTitle,
                description: finalDescription,
                meta: { sentBy: auth.user._id, target }
            }));
            await Notification.insertMany(docs, { ordered: false });
        }

        await Announcement.create({
            title: finalTitle,
            description: finalDescription,
            target,
            recipientCount: users.length,
            recipients: target === 'users' ? users.map((u) => ({ userId: u._id, name: u.name, email: u.email })) : [],
            sentBy: auth.user._id
        });

        return NextResponse.json({ success: true, count: users.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
