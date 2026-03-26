import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import Question from '@/models/Question';
import dayjs from 'dayjs';
import { getSubscriptionDisplayName, getLevelName } from '../helpers';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 10;
        const month = dayjs().format('YYYY-MM');

        let allUsers = await User.find({ role: 'student', 'monthlyProgress.month': month }).select('_id name username profilePicture monthlyProgress level subscriptionStatus quizBestScores').lean();

        if (allUsers.length < limit) {
            const additional = await User.find({ role: 'student', $or: [{ 'monthlyProgress.month': { $ne: month } }, { monthlyProgress: { $exists: false } }] })
                .select('_id name username profilePicture level subscriptionStatus quizBestScores')
                .sort({ 'level.highScoreQuizzes': -1 }).limit(limit - allUsers.length).lean();

            allUsers = [...allUsers, ...additional.map(u => ({
                ...u,
                monthlyProgress: { month, highScoreWins: u.level?.highScoreQuizzes || 0, totalQuizAttempts: u.level?.quizzesPlayed || 0, accuracy: u.level?.averageScore || 0, currentLevel: u.level?.currentLevel || 0, rewardEligible: false }
            }))];
        }

        allUsers.sort((a, b) => (b.monthlyProgress?.highScoreWins || 0) - (a.monthlyProgress?.highScoreWins || 0) || (b.monthlyProgress?.accuracy || 0) - (a.monthlyProgress?.accuracy || 0));

        const topUsers = allUsers.slice(0, limit);
        const topUserIds = topUsers.map(u => u._id);

        // Compute total questions answered fallback
        const attempts = await QuizAttempt.find({ user: { $in: topUserIds } }).select('user quiz').lean();
        const quizIds = [...new Set(attempts.map(a => a.quiz).filter(Boolean))];
        const questionCounts = await Question.aggregate([{ $match: { quiz: { $in: quizIds } } }, { $group: { _id: '$quiz', count: { $sum: 1 } } }]);
        const qMap = new Map(questionCounts.map(q => [q._id.toString(), q.count]));

        const userQCounts = {};
        attempts.forEach(a => { if (a.user) { const uid = a.user.toString(); userQCounts[uid] = (userQCounts[uid] || 0) + (qMap.get(a.quiz?.toString()) || 0); } });

        const data = topUsers.map((u, i) => ({
            _id: u._id, name: u.name, rank: i + 1, profilePicture: u.profilePicture,
            subscriptionName: getSubscriptionDisplayName(u.subscriptionStatus),
            userLevel: u.monthlyProgress?.currentLevel || 0,
            userLevelName: getLevelName(u.monthlyProgress?.currentLevel || 0),
            level: u.monthlyProgress?.currentLevel || 0, // Mobile parity
            highQuizzes: u.monthlyProgress?.highScoreWins || 0, // Mobile sorting parity
            totalQuizzes: u.monthlyProgress?.totalQuizAttempts || 0,
            accuracy: u.monthlyProgress?.accuracy || 0,
            totalScore: userQCounts[u._id.toString()] || 0,
            totalCorrectAnswers: u.level?.totalScore || 0,
            monthlyProgress: u.monthlyProgress // Mobile card parity
        }));

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
