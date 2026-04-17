import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamNews from '@/models/ExamNews';
import { protect, admin } from '@/middleware/auth';

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const news = await ExamNews.findByIdAndUpdate(id, body, { new: true });
        if (!news) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: news });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { id } = await params;
        await ExamNews.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
