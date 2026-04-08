import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Follow from '@/models/Follow';

export async function GET(req, { params }) {
    try {
        await dbConnect();

        // Ensure parameters are resolved
        const { id: userId } = await params;

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const following = await Follow.find({ follower: userId, status: 'active' })
            .populate('following', 'name username profilePicture followersCount followingCount')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Follow.countDocuments({ follower: userId, status: 'active' });

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
