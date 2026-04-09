import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

// GET blog by slug
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id: slug } = await params;
        const blog = await Blog.findOne({ slug, status: 'published' })
            .populate('author', 'name email')
            .populate('exam', 'name code')
            .lean();
        if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: blog });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST to increment views
export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Blog.updateOne({ _id: id }, { $inc: { views: 1 } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
