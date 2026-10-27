import { escapeRegex } from '@/lib/utils/pagination';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { resolveUserId } from '@/lib/utils/userRef';
import User from '@/models/User';
import Follow from '@/models/Follow';

export async function GET(req, { params }) {
    try {
        await dbConnect();

        // Ensure parameters are resolved
        const { id: userRef } = await params; // user id or username
        const userId = await resolveUserId(userRef);
        if (!userId) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 200);
        const skip = (page - 1) * limit;

        const user = await User.findById(userId).select('_id').lean();
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const search = (searchParams.get('search') || '').trim().slice(0, 100);
        const baseFilter = { follower: userId, status: 'active' };
        if (search) {
            const rx = new RegExp(escapeRegex(search), 'i');
            const matches = await User.find({ $or: [{ name: rx }, { username: rx }] }).select('_id').limit(500).lean();
            baseFilter.following = { $in: matches.map(u => u._id) };
        }

        const [following, total] = await Promise.all([
            Follow.find(baseFilter)
                .populate('following', 'name username profilePicture followersCount followingCount')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            Follow.countDocuments(baseFilter)
        ]);

        return NextResponse.json({
            success: true,
            following: following.map(f => f.following).filter(f => f !== null),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error('Get following error:', err);
        return NextResponse.json({ success: false, message: 'Failed to get following', error: err.message }, { status: 500 });
    }
}
