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

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'monthly';
        const date = searchParams.get('date');
        const week = searchParams.get('week');

        const user = await User.findOne({ username: username.toLowerCase() }).select('-password -googleId');
        if (!user) return errorResponse('User not found', 404);

        if (!auth.authenticated || auth.user.id !== user._id.toString()) {
            await User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 }, lastProfileView: new Date() });
        }

        const filterValue = type === 'daily' ? date : (type === 'weekly' ? week : null);
        const levelInfo = await User.getHistoricalLevelInfo(user._id, type, filterValue);
        
        if (!levelInfo && filterValue) {
            return errorResponse(`No historical data found for ${type} ${filterValue}`, 404);
        }

        const followersCount = await Follow.countDocuments({ following: user._id, status: 'active' });
        const followingCount = await Follow.countDocuments({ follower: user._id, status: 'active' });

        let isFollowing = false;
        const isOwnProfile = auth.authenticated && auth.user.id === user._id.toString();
        if (auth.authenticated && !isOwnProfile) {
            isFollowing = await Follow.exists({ follower: auth.user.id, following: user._id, status: 'active' });
        }

        const topQuizzes = (user.isPublicProfile || isOwnProfile) ? user.quizBestScores.sort((a, b) => b.bestScorePercentage - a.bestScorePercentage).slice(0, 10) : [];

        const competitionLevel = await User.getHistoricalCompetitionLevel(user._id, type, filterValue);
        
        let progress;
        if (filterValue) {
            // Reconstruct progress for stats from the levelInfo we just got
            progress = {
                totalQuizAttempts: levelInfo.progress.quizzesPlayed,
                highScoreWins: levelInfo.progress.highScoreQuizzes,
                accuracy: levelInfo.stats.highScoreRate
            };
        } else {
            progress = type === 'daily' ? user.dailyProgress : 
                       (type === 'weekly' ? user.weeklyProgress : user.monthlyProgress);
        }

        return successResponse({
            user: { 
                id: user._id, 
                name: user.name, 
                username: user.username, 
                bio: user.bio, 
                profilePicture: user.profilePicture, 
                level: levelInfo, 
                currentLevel: competitionLevel.currentLevel,
                levelName: competitionLevel.levelName,
                badges: user.badges, 
                followersCount, 
                followingCount, 
                profileViews: user.profileViews || 0, 
                isPublicProfile: user.isPublicProfile, 
                createdAt: user.createdAt 
            },
            isFollowing: !!isFollowing,
            isOwnProfile,
            stats: { 
                totalQuizzes: progress?.totalQuizAttempts || 0, 
                highScoreQuizzes: progress?.highScoreWins || 0, 
                averageScore: progress?.accuracy || 0, 
                topQuizzes 
            }
        });
    } catch (error) {
        return errorResponse(error);
    }
}
