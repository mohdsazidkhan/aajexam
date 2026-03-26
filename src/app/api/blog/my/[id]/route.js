import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import { protect } from '@/middleware/auth';

const stripHtml = (html) => {
    if (!html) return '';
    let text = html.replace(/<[^>]*>/g, '');
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    return text.replace(/\s+/g, ' ').trim();
};

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const blog = await Article.findOne({ _id: params.id, author: auth.user.id }).populate('category', 'name');
        if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: blog });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const blog = await Article.findOne({ _id: params.id, author: auth.user.id });
        if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        if (blog.status !== 'pending') return NextResponse.json({ message: 'Only pending blogs can be edited' }, { status: 403 });

        const body = await req.json();
        const { title, content, category, tags, featuredImage, featuredImageAlt, metaTitle, metaDescription, excerpt } = body;

        if (!title || !content || !category) return NextResponse.json({ message: 'Title, content, and category are required' }, { status: 400 });

        const contentText = stripHtml(content);
        blog.title = title;
        blog.content = content;
        blog.category = category;
        blog.excerpt = excerpt || contentText.substring(0, 160).trim();
        blog.metaTitle = (metaTitle || title || '').substring(0, 60).trim();
        blog.metaDescription = (metaDescription || contentText.substring(0, 160).trim()).substring(0, 160).trim();
        blog.featuredImageAlt = featuredImageAlt || title;
        if (featuredImage) blog.featuredImage = featuredImage;
        if (tags) blog.tags = Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(t => t) : String(tags).split(',').map(t => t.trim()).filter(t => t);

        await blog.save();
        return NextResponse.json({ success: true, message: 'Blog updated successfully', article: blog });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const blog = await Article.findOne({ _id: params.id, author: auth.user.id });
        if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
        if (blog.status !== 'pending') return NextResponse.json({ message: 'Only pending blogs can be deleted' }, { status: 403 });

        await Article.deleteOne({ _id: params.id });
        return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
