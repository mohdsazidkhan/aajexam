import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        await dbConnect();
        const userId = auth.user.id;
        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const requiredQuizzes = parseInt(process.env.MONTHLY_REWARD_QUIZ_REQUIREMENT) || 110;
        const isEligible = user.monthlyProgress?.currentLevel === 10 && user.monthlyProgress.highScoreQuizzes >= requiredQuizzes;

        const topUsers = await User.find({
            'level.currentLevel': 10,
            'level.highScoreQuizzes': { $gte: requiredQuizzes },
            subscriptionStatus: 'pro',
            status: 'active'
        })
            .select('name level monthlyProgress')
            .sort({
                'level.averageScore': -1,
                'monthlyProgress.accuracy': -1,
                'level.totalScore': -1,
                'level.quizzesPlayed': -1
            })
            .limit(10);

        let userRank = null;
        if (isEligible) {
            const userIndex = topUsers.findIndex(u => u._id.toString() === userId);
            if (userIndex !== -1) userRank = userIndex + 1;
        }

        const { distribution, totalPrizePool, activeProUsers, prizePerUser } = await User.getRewardDistribution();

        return NextResponse.json({
            success: true,
            data: {
                eligibility: {
                    isEligible,
                    currentLevel: user.monthlyProgress?.currentLevel,
                    highScoreQuizzes: user.monthlyProgress.highScoreQuizzes,
                    requiredLevel: 10,
                    requiredHighScoreQuizzes: requiredQuizzes,
                    userRank
                },
                currentRankings: topUsers.map((u, index) => ({
                    rank: index + 1,
                    name: u.name,
                    averageScore: u.level.averageScore,
                    accuracy: u.monthlyProgress.accuracy,
                    totalScore: u.level.totalScore,
                    quizzesPlayed: u.level.quizzesPlayed,
                    highScoreQuizzes: u.level.highScoreQuizzes,
                    potentialReward: distribution[index]?.amount || 0
                })),
                rewardDistribution: distribution,
                totalPrizePool,
                activeProUsers,
                prizePerUser: prizePerUser || Number(process.env.NEXT_PUBLIC_PRIZE_PER_PRO || process.env.PRIZE_PER_PRO || 90)
            }
        });

    } catch (error) {
        console.error('Monthly reward info error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
