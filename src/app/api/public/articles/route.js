import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import User from '@/models/User';
import Category from '@/models/Category';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 10;
        const page = parseInt(searchParams.get('page')) || 1;
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const skip = (page - 1) * limit;

        const query = { status: 'published' };
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        if (category) {
            query.category = category;
        }
        
        if (featured === 'true') {
            query.isFeatured = true;
        }
        // If featured is 'false' or not provided, we return both featured and non-featured articles
        // to ensure the user gets all results on the main blog list.

        const articles = await Article.find(query)
            .populate('author', 'name email')
            .populate('category', 'name')
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Article.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
                articles,
                pagination: {
                    total,
                    totalPages,
                    page,
                    limit,
                    hasPrev: page > 1,
                    hasNext: page < totalPages
                }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
