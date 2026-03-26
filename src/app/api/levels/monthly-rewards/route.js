import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const user = await User.findById(auth.user.id);
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        const requiredQuizzes = parseInt(process.env.MONTHLY_REWARD_QUIZ_REQUIREMENT) || 110;
        const isEligible = user.monthlyProgress?.currentLevel === 10 && user.monthlyProgress.highScoreQuizzes >= requiredQuizzes;

        const topUsers = await User.find({
            'level.currentLevel': 10,
            'level.highScoreQuizzes': { $gte: requiredQuizzes },
            subscriptionStatus: 'pro',
            status: 'active'
        })
            .select('name level monthlyProgress')
            .sort({ 'level.averageScore': -1, 'monthlyProgress.accuracy': -1, 'level.totalScore': -1, 'level.quizzesPlayed': -1 })
            .limit(10);

        let userRank = null;
        if (isEligible) {
            const idx = topUsers.findIndex(u => u._id.toString() === auth.user.id);
            if (idx !== -1) userRank = idx + 1;
        }

        const { distribution, totalPrizePool, activeProUsers, prizePerUser } = await User.getRewardDistribution();

        return NextResponse.json({
            success: true,
            data: {
                eligibility: { isEligible, currentLevel: user.monthlyProgress?.currentLevel, highScoreQuizzes: user.monthlyProgress.highScoreQuizzes, requiredLevel: 10, requiredHighScoreQuizzes: requiredQuizzes, userRank },
                currentRankings: topUsers.map((u, i) => ({
                    rank: i + 1,
                    name: u.name,
                    averageScore: u.level.averageScore,
                    accuracy: u.monthlyProgress.accuracy,
                    totalScore: u.level.totalScore,
                    quizzesPlayed: u.level.quizzesPlayed,
                    highScoreQuizzes: u.level.highScoreQuizzes,
                    potentialReward: distribution[i]?.amount || 0
                })),
                rewardDistribution: distribution,
                totalPrizePool,
                activeProUsers,
                prizePerUser: prizePerUser || parseInt(process.env.NEXT_PUBLIC_PRIZE_PER_PRO) || parseInt(process.env.PRIZE_PER_PRO) || 90
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
