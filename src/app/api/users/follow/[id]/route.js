import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Follow from '@/models/Follow';
import { protect } from '@/middleware/auth';

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const followerId = auth.user.id;
        const { id } = await params;

        if (followerId === id) return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });

        const userToFollow = await User.findById(id);
        if (!userToFollow) return NextResponse.json({ message: 'User not found' }, { status: 404 });
        if (userToFollow.status !== 'active') return NextResponse.json({ message: 'Cannot follow this user' }, { status: 400 });

        const existingFollow = await Follow.findOne({ follower: followerId, following: id });
        if (existingFollow) return NextResponse.json({ message: 'Already following' }, { status: 400 });

        await Follow.create({ follower: followerId, following: id });
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(id, { $inc: { followersCount: 1 } });

        return NextResponse.json({ success: true, message: 'Followed', following: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
