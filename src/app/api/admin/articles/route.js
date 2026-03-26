import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
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
        const author = searchParams.get('author');
        const isFeatured = searchParams.get('isFeatured');
        const isPinned = searchParams.get('isPinned');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) query.status = status;
        if (author) query.author = author;
        if (isFeatured !== null && isFeatured !== '') query.isFeatured = isFeatured === 'true';
        if (isPinned !== null && isPinned !== '') query.isPinned = isPinned === 'true';

        const articles = await Article.find(query)
            .populate('author', 'name email role')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            articles,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        console.error('Admin articles error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        
        // Handle both JSON and FormData
        let data = {};
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            
            // Extract basic fields
            formData.forEach((value, key) => {
                if (key !== 'tags[]' && key !== 'featuredImageFile') {
                    data[key] = value;
                }
            });
            
            // Handle tags[]
            const tags = formData.getAll('tags[]');
            if (tags && tags.length > 0) {
                data.tags = tags;
            }
            
            // Handle image upload
            const file = formData.get('featuredImageFile');
            if (file && typeof file !== 'string') {
                try {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
                    const uploadResult = await uploadImage(base64Image, 'articles');
                    data.featuredImage = uploadResult.secure_url;
                } catch (uploadErr) {
                    console.error('Image upload failed:', uploadErr);
                    // Continue without the new image if upload fails, or throw
                }
            }
        } else {
            data = await req.json();
        }

        // Convert string representations of booleans
        if (typeof data.isFeatured === 'string') data.isFeatured = data.isFeatured === 'true';
        if (typeof data.isPinned === 'string') data.isPinned = data.isPinned === 'true';

        const article = new Article({
            ...data,
            author: auth.user.id,
            publishedAt: data.status === 'published' ? new Date() : null
        });

        await article.save();
        return NextResponse.json({ message: 'Article created successfully', article }, { status: 201 });
    } catch (error) {
        console.error('Admin create article error:', error);
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}
