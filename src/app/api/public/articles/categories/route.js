import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';

export async function GET() {
    try {
        await dbConnect();
        
        const categories = await Article.distinct('category', { status: 'published' });

        return NextResponse.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Article categories error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
