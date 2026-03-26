import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import WalletTransaction from '@/models/WalletTransaction';
import { protect, admin } from '@/middleware/auth';

import { uploadImage } from '@/lib/cloudinary';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const article = await Article.findById(params.id)
            .populate('author', 'name email')
            .populate('category', 'name');
        if (!article) return NextResponse.json({ message: 'Article not found' }, { status: 404 });

        return NextResponse.json({ success: true, article });
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
                }
            }
        } else {
            data = await req.json();
        }

        // Convert string representations of booleans
        if (typeof data.isFeatured === 'string') data.isFeatured = data.isFeatured === 'true';
        if (typeof data.isPinned === 'string') data.isPinned = data.isPinned === 'true';

        // Find existing article to check status change
        const article = await Article.findById(params.id);
        if (!article) return NextResponse.json({ message: 'Article not found' }, { status: 404 });

        const oldStatus = article.status;
        const newStatus = data.status;

        // Update article
        Object.assign(article, data);
        
        // Set publishedAt if it's currently null and the new status is 'published' or 'approved'
        if (!article.publishedAt && (newStatus === 'published' || newStatus === 'approved')) {
            article.publishedAt = new Date();
        }
        
        await article.save();
        
        // If newly approved, credit the user
        if (newStatus === 'approved' && oldStatus !== 'approved') {
            // Calculate reward based on tier
            let rewardAmount = 15; // Default fallback
            const tier = data.rewardTier || article.rewardTier;
            
            if (tier === 'normal') rewardAmount = 5;
            else if (tier === 'good') rewardAmount = 10;
            else if (tier === 'high') rewardAmount = 15;
            else {
                // Fallback to env var if tier not specified or invalid
                rewardAmount = parseInt(process.env.PER_USER_BLOG_CREDIT_AMOUNT) || 15;
            }
            
            await WalletTransaction.create({
                user: article.author,
                type: 'credit',
                amount: rewardAmount,
                description: `Blog approved: ${article.title.substring(0, 30)}...`,
                category: 'blog_reward',
                status: 'completed',
                metadata: { articleId: article._id, tier: tier }
            });

            // Update user wallet balance
            const User = (await import('@/models/User')).default;
            await User.findByIdAndUpdate(article.author, {
                $inc: { walletBalance: rewardAmount }
            });
        }

        return NextResponse.json({ success: true, message: 'Article updated successfully', article });
    } catch (error) {
        console.error('Admin update article error:', error);
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
        await Article.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true, message: 'Article deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
