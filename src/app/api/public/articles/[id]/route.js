import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id: slug } = await params;
        const article = await Article.findOne({ slug, status: 'published' })
            .populate('author', 'name email')
            .populate('category', 'name')
            .lean();
        if (!article) return NextResponse.json({ message: 'Article not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: article });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
