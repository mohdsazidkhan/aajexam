import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { protect, admin } from '@/middleware/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const exam = searchParams.get('exam');
        const search = searchParams.get('search');
        const isFeatured = searchParams.get('isFeatured');
        const isPinned = searchParams.get('isPinned');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) query.status = status;
        if (exam) query.exam = exam;
        if (isFeatured !== null && isFeatured !== '') query.isFeatured = isFeatured === 'true';
        if (isPinned !== null && isPinned !== '') query.isPinned = isPinned === 'true';
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const blogs = await Blog.find(query)
            .populate('author', 'name email role')
            .populate('exam', 'name code')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            blogs,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        console.error('Admin blogs error:', error);
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        let data = {};
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                if (key !== 'tags[]' && key !== 'featuredImageFile') {
                    data[key] = value;
                }
            });
            const tags = formData.getAll('tags[]');
            if (tags && tags.length > 0) data.tags = tags;

            const file = formData.get('featuredImageFile');
            if (file && typeof file !== 'string') {
                try {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
                    const uploadResult = await uploadImage(base64Image, 'blogs');
                    data.featuredImage = uploadResult.secure_url;
                } catch (uploadErr) {
                    console.error('Image upload failed:', uploadErr);
                }
            }
        } else {
            data = await req.json();
        }

        if (typeof data.isFeatured === 'string') data.isFeatured = data.isFeatured === 'true';
        if (typeof data.isPinned === 'string') data.isPinned = data.isPinned === 'true';

        const blog = new Blog({
            ...data,
            author: auth.user.id,
            authorName: auth.user.name || '',
            publishedAt: data.status === 'published' ? new Date() : null
        });

        await blog.save();
        return NextResponse.json({ message: 'Blog created successfully', blog }, { status: 201 });
    } catch (error) {
        console.error('Admin create blog error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create blog' }, { status: 500 });
    }
}
