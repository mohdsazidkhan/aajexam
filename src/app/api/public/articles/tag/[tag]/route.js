import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { tag } = await params;

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const normalizedTag = String(tag).toLowerCase();

        const articles = await Article.find({
            status: 'published',
            tags: normalizedTag
        })
            .populate('author', 'name email')
            .populate('category', 'name')
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments({ status: 'published', tags: normalizedTag });
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
                tag: normalizedTag,
                articles,
                pagination: {
                    page: page,
                    limit: limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching articles by tag:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch articles by tag',
            error: error.message
        }, { status: 500 });
    }
}
