import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import dayjs from 'dayjs';
import { getSubscriptionDisplayName, getLevelName } from '../helpers';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 10;
        const currentUserId = auth.authenticated ? auth.user.id : null;
        const month = dayjs().format('YYYY-MM');

        let allUsers = await User.find({ role: 'student', 'monthlyProgress.month': month }).select('_id name monthlyProgress createdAt subscriptionStatus').lean();

        if (allUsers.length < limit) {
            const additionalUsers = await User.find({ role: 'student', $or: [{ 'monthlyProgress.month': { $ne: month } }, { monthlyProgress: { $exists: false } }] })
                .select('_id name level createdAt subscriptionStatus')
                .sort({ 'level.highScoreQuizzes': -1, 'level.averageScore': -1 })
                .limit(limit - allUsers.length).lean();

            allUsers = [...allUsers, ...additionalUsers.map(u => ({
                ...u,
                monthlyProgress: { month, highScoreWins: u.level?.highScoreQuizzes || 0, totalQuizAttempts: u.level?.quizzesPlayed || 0, accuracy: u.level?.averageScore || 0, currentLevel: u.level?.currentLevel || 0, rewardEligible: false }
            }))];
        }

        allUsers.sort((a, b) => (b.monthlyProgress?.highScoreWins || 0) - (a.monthlyProgress?.highScoreWins || 0) || (b.monthlyProgress?.accuracy || 0) - (a.monthlyProgress?.accuracy || 0));

        const topPerformers = allUsers.slice(0, limit);
        const formatUser = (u, pos, isCurr) => ({
            _id: u._id, name: u.name, position: pos, isCurrentUser: isCurr,
            subscriptionName: getSubscriptionDisplayName(u.subscriptionStatus),
            level: { currentLevel: u.monthlyProgress?.currentLevel || 0, levelName: getLevelName(u.monthlyProgress?.currentLevel || 0), highScoreQuizzes: u.monthlyProgress?.highScoreWins || 0, quizzesPlayed: u.monthlyProgress?.totalQuizAttempts || 0, accuracy: u.monthlyProgress?.accuracy || 0 },
            monthly: { month: u.monthlyProgress?.month || month, highScoreWins: u.monthlyProgress?.highScoreWins || 0, totalQuizAttempts: u.monthlyProgress?.totalQuizAttempts || 0, accuracy: u.monthlyProgress?.accuracy || 0, rewardEligible: u.monthlyProgress?.rewardEligible || false }
        });

        return NextResponse.json({
            success: true,
            data: {
                topPerformers: topPerformers.map((u, i) => formatUser(u, i + 1, u._id.toString() === currentUserId?.toString())),
                month,
                total: allUsers.length
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
