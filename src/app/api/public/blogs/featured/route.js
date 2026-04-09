import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

export async function GET() {
    try {
        await dbConnect();
        const blogs = await Blog.find({ status: 'published', isFeatured: true })
            .populate('author', 'name email')
            .populate('exam', 'name code')
            .sort({ publishedAt: -1 })
            .limit(5)
            .lean();
        return NextResponse.json({ success: true, data: blogs });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
