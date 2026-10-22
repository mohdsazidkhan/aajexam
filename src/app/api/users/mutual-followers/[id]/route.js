import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Follow from '@/models/Follow';
import { protect } from '@/middleware/auth';
import { parsePaging } from '@/lib/utils/pagination';

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
        const { searchParams } = new URL(req.url);
        const { page, limit, skip } = parsePaging(searchParams, { defaultLimit: 20, maxLimit: 100, legacyCap: 20 });

        // We implement getMutualFollowers in-line if the static method isn't fully ported to aajexam yet
        // Mutual strategy: users that I follow, who also follow me (this is getMutualFollowers(currentUserId))
        // However, the target is `userId`: we want mutuals between `currentUserId` and `userId`.
        // Let's implement the logic from aajexam-backend

        let mutualIds = [];
        if (typeof Follow.getMutualFollowers === 'function') {
            mutualIds = await Follow.getMutualFollowers(currentUserId);
        } else {
            const [following, followers] = await Promise.all([
                Follow.find({ follower: currentUserId, status: 'active' }).distinct('following'),
                Follow.find({ following: currentUserId, status: 'active' }).distinct('follower')
            ]);

            const followersSet = new Set(followers.map(id => id.toString()));
            mutualIds = following.map(id => id.toString()).filter(id => followersSet.has(id));
        }

        // Only check the candidates against the target's followers (indexed $in), not the target's whole follower list.
        const targetFollowerIds = mutualIds.length
            ? await Follow.find({ following: userId, follower: { $in: mutualIds } }).select('follower').lean()
            : [];
        const targetFollowerSet = new Set(targetFollowerIds.map(f => f.follower.toString()));

        const mutual = mutualIds.filter(id => targetFollowerSet.has(id.toString()));
        const total = mutual.length;
        const pagedMutualIds = mutual.slice(skip, skip + limit);

        const mutualUsers = await User.find({ _id: { $in: pagedMutualIds } })
            .select('name username profilePicture')
            .lean();

        return NextResponse.json({
            success: true,
            mutualFollowers: mutualUsers,
            count: total,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });

    } catch (err) {
        console.error('Get mutual followers error:', err);
        return NextResponse.json({ success: false, message: 'Failed to get mutual followers', error: err.message }, { status: 500 });
    }
}
