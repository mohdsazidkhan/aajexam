import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { protect, admin } from '@/middleware/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        const blog = await Blog.findById(id)
            .populate('author', 'name email')
            .populate('exam', 'name code');
        if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });

        return NextResponse.json({ success: true, blog });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;

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

        const blog = await Blog.findById(id);
        if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });

        Object.assign(blog, data);

        if (!blog.publishedAt && data.status === 'published') {
            blog.publishedAt = new Date();
        }

        await blog.save();
        return NextResponse.json({ success: true, message: 'Blog updated successfully', blog });
    } catch (error) {
        console.error('Admin update blog error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        await Blog.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
