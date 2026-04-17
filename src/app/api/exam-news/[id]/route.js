import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamNews from '@/models/ExamNews';

// GET - Single news detail
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const news = await ExamNews.findById(id).populate('exam', 'name code');
        if (!news) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        news.views += 1;
        await news.save();

        return NextResponse.json({ success: true, data: news });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
