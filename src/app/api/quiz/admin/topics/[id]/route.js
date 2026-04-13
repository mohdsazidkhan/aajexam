import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Topic from '@/models/Topic';
import { protect, admin } from '@/middleware/auth';

// GET - single topic
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const topic = await Topic.findById(id).populate('subject', 'name');
        if (!topic) return NextResponse.json({ message: 'Topic not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: topic });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - update topic
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const body = await req.json();
        const topic = await Topic.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!topic) return NextResponse.json({ message: 'Topic not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: topic });
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ success: false, message: 'Duplicate topic name for this subject' }, { status: 409 });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - soft delete
export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();

        const { id } = await params;
        const topic = await Topic.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!topic) return NextResponse.json({ message: 'Topic not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Topic deactivated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
