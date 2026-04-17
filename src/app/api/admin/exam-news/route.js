import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamNews from '@/models/ExamNews';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const [news, total] = await Promise.all([
            ExamNews.find().populate('exam', 'name code').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            ExamNews.countDocuments()
        ]);

        return NextResponse.json({ success: true, data: news, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
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
        body.createdBy = auth.user._id;
        const news = await ExamNews.create(body);
        return NextResponse.json({ success: true, data: news }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
