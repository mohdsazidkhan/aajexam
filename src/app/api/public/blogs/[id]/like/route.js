import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const result = await Blog.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true }).select('likes');
        if (!result) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        return NextResponse.json({ success: true, likes: result.likes });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
