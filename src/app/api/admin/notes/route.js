import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyNote from '@/models/StudyNote';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const [notes, total] = await Promise.all([
            StudyNote.find()
                .populate('subject', 'name')
                .populate('topic', 'name')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            StudyNote.countDocuments()
        ]);

        return NextResponse.json({ success: true, data: notes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const body = await req.json();
        body.contributor = auth.user._id;
        body.isAdminCreated = true;

        const note = await StudyNote.create(body);
        return NextResponse.json({ success: true, data: note }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
