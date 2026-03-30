import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import User from '@/models/User';
import Category from '@/models/Category';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { categoryId } = await params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ success: false, message: 'Invalid category ID' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const articles = await Article.find({
            category: categoryId,
            status: 'published'
        })
            .populate('author', 'name email')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments({
            category: categoryId,
            status: 'published'
        });

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
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
        console.error('Error fetching articles by category:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch articles by category',
            error: error.message
        }, { status: 500 });
    }
}
