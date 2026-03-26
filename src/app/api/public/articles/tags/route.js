import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

export async function GET() {
    try {
        await dbConnect();
        
        const tags = await Article.distinct('tags', { status: 'published' });

        return NextResponse.json({
            success: true,
            data: tags
        });
    } catch (error) {
        console.error('Article tags error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
