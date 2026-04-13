import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Topic from '@/models/Topic';

// GET - public: list active topics for a subject
export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const subject = searchParams.get('subject');
        if (!subject) return NextResponse.json({ message: 'subject query param is required' }, { status: 400 });

        const topics = await Topic.find({ subject, isActive: true })
            .select('name description order')
            .sort({ order: 1, name: 1 });

        return NextResponse.json({ success: true, data: topics });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
