import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const rewardTier = searchParams.get('rewardTier');

        // Filter for non-admin users (students)
        const nonAdminUsers = await User.find({ role: { $ne: 'admin' } }).select('_id');
        const nonAdminUserIds = nonAdminUsers.map(u => u._id);

        let query = {
            author: { $in: nonAdminUserIds }
        };

        if (status) query.status = status;
        if (category) query.category = category;
        if (rewardTier) query.rewardTier = rewardTier;

        if (search && search.trim()) {
            query.$or = [
                { title: new RegExp(search.trim(), 'i') },
                { content: new RegExp(search.trim(), 'i') },
                { tags: new RegExp(search.trim(), 'i') }
            ];
        }

        const blogs = await Article.find(query)
            .populate('author', 'name email')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            blogs,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        console.error('Admin user-blogs error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch user blogs', message: error.message }, { status: 500 });
    }
}
