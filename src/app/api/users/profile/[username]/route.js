import dbConnect from '@/lib/db';
import User from '@/models/User';
import Follow from '@/models/Follow';
import { protect } from '@/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { username } = await params;
        const auth = await protect(req);

        const user = await User.findOne({ username: username.toLowerCase() }).select('-password -googleId');
        if (!user) return errorResponse('User not found', 404);

        if (!auth.authenticated || auth.user.id !== user._id.toString()) {
            await User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 }, lastProfileView: new Date() });
        }

        const followersCount = await Follow.countDocuments({ following: user._id, status: 'active' });
        const followingCount = await Follow.countDocuments({ follower: user._id, status: 'active' });

        let isFollowing = false;
        const isOwnProfile = auth.authenticated && auth.user.id === user._id.toString();
        if (auth.authenticated && !isOwnProfile) {
            isFollowing = await Follow.exists({ follower: auth.user.id, following: user._id, status: 'active' });
        }

        return successResponse({
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                bio: user.bio,
                profilePicture: user.profilePicture,
                badges: user.badges,
                followersCount,
                followingCount,
                profileViews: user.profileViews || 0,
                isPublicProfile: user.isPublicProfile,
                createdAt: user.createdAt
            },
            isFollowing: !!isFollowing,
            isOwnProfile,
            stats: {}
        });
    } catch (error) {
        return errorResponse(error);
    }
}
