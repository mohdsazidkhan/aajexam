import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Follow from '@/models/Follow';
import { protect } from '@/middleware/auth';

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const followerId = auth.user.id;
        const { id } = await params;

        const result = await Follow.findOneAndDelete({ follower: followerId, following: id });
        if (!result) return NextResponse.json({ message: 'Not following' }, { status: 400 });

        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
        await User.findByIdAndUpdate(id, { $inc: { followersCount: -1 } });

        return NextResponse.json({ success: true, message: 'Unfollowed', following: false });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
