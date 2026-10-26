import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import Announcement from '@/models/Announcement';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';
import { isAnnounceCondition, announceConditionFilter } from '@/lib/announceConditions';

// Students an announcement would reach: role student + target (all / pro / free) + optional profile condition.
function audienceQuery(target, condition) {
    const query = { role: 'student' };
    if (target === 'pro') query.subscriptionStatus = 'PRO';
    if (target === 'free') query.subscriptionStatus = 'FREE';
    if (condition) query.$and = [announceConditionFilter(condition)];
    return query;
}

// GET - How many students an audience would reach (the modal's live preview)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        const { searchParams } = new URL(req.url);
        const target = searchParams.get('target') || 'all';
        const condition = searchParams.get('condition') || '';
        if (!['all', 'pro', 'free'].includes(target) || (condition && !isAnnounceCondition(condition))) {
            return NextResponse.json({ success: false, message: 'Invalid audience' }, { status: 400 });
        }
        await dbConnect();
        const count = await User.countDocuments(audienceQuery(target, condition));
        return NextResponse.json({ success: true, count });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Send an announcement notification to a segment of users
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { title, description, target, userIds, condition: rawCondition } = await req.json();

        const trimmedTitle = (title || '').trim();
        const trimmedDescription = (description || '').trim();
        if (!trimmedTitle || !trimmedDescription) {
            return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
        }
        if (!['all', 'pro', 'free', 'users'].includes(target)) {
            return NextResponse.json({ success: false, message: 'Invalid target' }, { status: 400 });
        }

        // A profile condition only narrows all / pro / free; picked users are sent to as chosen.
        const condition = target !== 'users' && rawCondition ? String(rawCondition) : '';
        if (condition && !isAnnounceCondition(condition)) {
            return NextResponse.json({ success: false, message: 'Invalid condition' }, { status: 400 });
        }

        const query = target === 'users' ? { role: 'student' } : audienceQuery(target, condition);
        if (target === 'users') {
            if (!Array.isArray(userIds) || userIds.length === 0) {
                return NextResponse.json({ success: false, message: 'Select at least one user' }, { status: 400 });
            }
            query._id = { $in: userIds };
        }

        const finalTitle = trimmedTitle.slice(0, 200);
        const finalDescription = trimmedDescription.slice(0, 5000);

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
            condition,
            recipientCount: count,
            recipients: named,
            sentBy: auth.user._id
        });

        return NextResponse.json({ success: true, count });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
