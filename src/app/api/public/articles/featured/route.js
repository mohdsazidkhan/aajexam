import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

export async function GET() {
    try {
        await dbConnect();
        const articles = await Article.find({ status: 'published', isFeatured: true })
            .populate('author', 'name email')
            .populate('category', 'name')
            .sort({ publishedAt: -1 })
            .limit(5)
            .lean();
        return NextResponse.json({ success: true, data: articles });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
