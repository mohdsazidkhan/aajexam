import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit')) || 10;

        const articles = await Article.find({
            status: 'published',
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
            ]
        })
        .select('title slug description featuredImage createdAt author')
        .limit(limit);

        return NextResponse.json({
            success: true,
            data: articles
        });
    } catch (error) {
        console.error('Article search error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
