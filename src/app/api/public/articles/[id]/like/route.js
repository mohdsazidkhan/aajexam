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

        try {
            await article.incrementLikes();
        } catch (e) {
            console.error('incrementLikes failed (non-blocking):', e.message);
        }

        return NextResponse.json({
            success: true,
            message: 'Like count updated',
            likes: article.likes
        });
    } catch (error) {
        console.error('Error incrementing article likes:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update like count',
            error: error.message
        }, { status: 500 });
    }
}
