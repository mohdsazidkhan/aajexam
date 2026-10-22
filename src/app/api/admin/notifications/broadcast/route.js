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

        const finalTitle = trimmedTitle.slice(0, 200);
        const finalDescription = trimmedDescription.slice(0, 500);

        // Stream recipients and insert in batches so a broadcast to millions of students
        // never holds the whole user list (or one giant insertMany) in memory.
        const BATCH = 1000;
        let count = 0;
        let batch = [];
        const flush = async () => {
            if (!batch.length) return;
            await Notification.insertMany(batch, { ordered: false });
            batch = [];
        };
        const named = [];
        const cursor = User.find(query).select(target === 'users' ? '_id name email' : '_id').lean().cursor({ batchSize: BATCH });
        for await (const u of cursor) {
            count++;
            if (target === 'users' && named.length < 1000) named.push({ userId: u._id, name: u.name, email: u.email });
            batch.push({
                userId: u._id,
                type: 'announcement',
                title: finalTitle,
                description: finalDescription,
                meta: { sentBy: auth.user._id, target }
            });
            if (batch.length >= BATCH) await flush();
        }
        await flush();

        await Announcement.create({
            title: finalTitle,
            description: finalDescription,
            target,
            recipientCount: count,
            recipients: named,
            sentBy: auth.user._id
        });

        return NextResponse.json({ success: true, count });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
