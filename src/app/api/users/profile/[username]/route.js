import dbConnect from '@/lib/db';
import User from '@/models/User';
import Follow from '@/models/Follow';
import Reel from '@/models/Reel';
import QuizAttempt from '@/models/QuizAttempt';
import { protect } from '@/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { getExamAIR, getQuizAIR } from '@/lib/utils/rankUtils';
import { regionRanksFor } from '@/lib/utils/regionRank';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { username } = await params;
        const auth = await protect(req);

        const user = await User.findOne({ username: username.toLowerCase() }).select('-password -googleId').lean();
        if (!user) return errorResponse('User not found', 404);

        const isOwnProfile = auth.authenticated && auth.user.id === user._id.toString();
        const viewBump = isOwnProfile
            ? null
            : User.updateOne({ _id: user._id }, { $inc: { profileViews: 1 }, lastProfileView: new Date() }).exec();
        const followCheck = auth.authenticated && !isOwnProfile
            ? Follow.exists({ follower: auth.user.id, following: user._id, status: 'active' }).exec()
            : null;
        const regionRanksP = user.isPublicProfile || isOwnProfile ? regionRanksFor(user) : null;

        const [followersCount, followingCount, reelsCount, examAIR, quizAIR, quizzesAttempted] = await Promise.all([
            Follow.countDocuments({ following: user._id, status: 'active' }),
            Follow.countDocuments({ follower: user._id, status: 'active' }),
            Reel.countDocuments({ createdBy: user._id, status: 'published' }),
            getExamAIR(user._id),
            getQuizAIR(user._id),
            QuizAttempt.countDocuments({ user: user._id, status: 'Completed' })
        ]);

        const [isFollowing, regionRanksRaw] = await Promise.all([followCheck, regionRanksP, viewBump]);
        const isFollowingFlag = isFollowing || false;
        const regionRanks = regionRanksRaw || {};

        return successResponse({
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                bio: user.bio,
                city: user.city,
                state: user.state,
                primaryTargetExam: user.primaryTargetExam,
                profilePicture: user.profilePicture,
                badges: user.badges,
                followersCount,
                followingCount,
                reelsCount,
                profileViews: user.profileViews || 0,
                socialLinks: user.isPublicProfile || isOwnProfile ? (user.socialLinks || {}) : {},
                isPro: user.subscriptionStatus === 'PRO' && user.status === 'active' && new Date(user.subscriptionExpiry) > new Date(),
                isPublicProfile: user.isPublicProfile,
                createdAt: user.createdAt,
                performanceMetrics: user.performanceMetrics
            },
            isFollowing: !!isFollowingFlag,
            isOwnProfile,
            stats: { examAIR, quizAIR, quizzesAttempted, ...regionRanks }
        });
    } catch (error) {
        return errorResponse(error);
    }
}
