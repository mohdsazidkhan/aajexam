import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';
import { protect } from '@/middleware/auth';
import { stripHtml, generateExcerpt } from '@/utils/text';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const { id } = await params;
        const blog = await Article.findOne({ _id: id, author: auth.user.id }).populate('category', 'name');
        if (!blog) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: blog });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const { id } = await params;
        const data = await req.json();
        const blog = await Article.findOne({ _id: id, author: auth.user.id });

        if (!blog) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        if (blog.status !== 'pending') return NextResponse.json({ success: false, message: 'Cannot edit approved/rejected blog' }, { status: 403 });

        const cleanContent = stripHtml(data.content || blog.content);
        Object.assign(blog, {
            ...data,
            excerpt: data.excerpt || generateExcerpt(cleanContent),
            metaTitle: data.metaTitle || data.title?.substring(0, 60),
            metaDescription: data.metaDescription || generateExcerpt(cleanContent)
        });

        await blog.save();
        return NextResponse.json({ success: true, article: blog });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const { id } = await params;
        const blog = await Article.findOne({ _id: id, author: auth.user.id });

        if (!blog) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        if (blog.status !== 'pending') return NextResponse.json({ success: false, message: 'Cannot delete processed blog' }, { status: 403 });

        await Article.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
