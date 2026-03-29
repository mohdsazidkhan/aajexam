import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Follow from '@/models/Follow';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();

        const authRecord = await protect(req);
        if (!authRecord.authenticated) {
            return NextResponse.json({ message: authRecord.message || 'Unauthorized' }, { status: 401 });
        }
        const currentUserId = authRecord.user.id;

        // Ensure parameters are resolved
        const { id: userId } = await params;

        // We implement getMutualFollowers in-line if the static method isn't fully ported to aajexam yet
        // Mutual strategy: users that I follow, who also follow me (this is getMutualFollowers(currentUserId))
        // However, the target is `userId`: we want mutuals between `currentUserId` and `userId`.
        // Let's implement the logic from aajexam-backend

        let mutualIds = [];
        if (typeof Follow.getMutualFollowers === 'function') {
            mutualIds = await Follow.getMutualFollowers(currentUserId);
        } else {
            const following = await Follow.find({ follower: currentUserId, status: 'active' }).distinct('following');
            const followers = await Follow.find({ following: currentUserId, status: 'active' }).distinct('follower');

            const followingStrs = following.map(id => id.toString());
            const followersStrs = followers.map(id => id.toString());

            mutualIds = followingStrs.filter(id => followersStrs.includes(id));
        }

        const targetFollowerIds = await Follow.find({ following: userId }).select('follower');
        const targetFollowerIdStrings = targetFollowerIds.map(f => f.follower.toString());

        const mutual = mutualIds.filter(id => targetFollowerIdStrings.includes(id.toString()));

        const mutualUsers = await User.find({ _id: { $in: mutual } })
            .select('name username profilePicture level.currentLevel level.levelName');

        return NextResponse.json({
            success: true,
            mutualFollowers: mutualUsers,
            count: mutualUsers.length
        });

    } catch (err) {
        console.error('Get mutual followers error:', err);
        return NextResponse.json({ success: false, message: 'Failed to get mutual followers', error: err.message }, { status: 500 });
    }
}
