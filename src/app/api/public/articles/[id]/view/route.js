import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import mongoose from 'mongoose';

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid article ID' }, { status: 400 });
        }

        const article = await Article.findById(id);
        if (!article) {
            return NextResponse.json({
                success: false,
                message: 'Article not found'
            }, { status: 404 });
        }

        await article.incrementViews();

        return NextResponse.json({
            success: true,
            message: 'View count updated',
            views: article.views
        });
    } catch (error) {
        console.error('Error incrementing article views:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update view count',
            error: error.message
        }, { status: 500 });
    }
}
