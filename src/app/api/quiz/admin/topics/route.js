import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Topic from '@/models/Topic';
import { protect, admin } from '@/middleware/auth';

// GET - list topics (filter by subject)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const subject = searchParams.get('subject');
        const filter = {};
        if (subject) filter.subject = subject;

        const topics = await Topic.find(filter).populate('subject', 'name').sort({ order: 1, name: 1 });
        return NextResponse.json({ success: true, data: topics });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - create topic
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { subject, name, description, order } = await req.json();
        if (!subject || !name) return NextResponse.json({ message: 'subject and name are required' }, { status: 400 });

        const topic = await Topic.create({ subject, name, description, order });
        return NextResponse.json({ success: true, data: topic }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ success: false, message: 'This topic already exists for this subject' }, { status: 409 });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
