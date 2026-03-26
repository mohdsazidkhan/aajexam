import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import dayjs from 'dayjs';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit')) || 3, 50);
        const month = dayjs().format('YYYY-MM');

        const users = await User.find({ role: 'student', status: 'active' }).select('name dailyProgress weeklyProgress monthlyProgress badges subscriptionStatus').lean();

        users.sort((a, b) => 
            (b.monthlyProgress?.highScoreWins || 0) - (a.monthlyProgress?.highScoreWins || 0) || 
            (b.monthlyProgress?.accuracy || 0) - (a.monthlyProgress?.accuracy || 0) ||
            (b.monthlyProgress?.totalScore || 0) - (a.monthlyProgress?.totalScore || 0) ||
            (b.monthlyProgress?.totalQuizAttempts || 0) - (a.monthlyProgress?.totalQuizAttempts || 0)
        );

        const top = users.slice(0, limit).map((u, idx) => ({
            userId: u._id, name: u.name, rank: idx + 1, month,
            level: { currentLevel: u.level?.currentLevel || 0, highScoreQuizzes: u.level?.highScoreQuizzes || 0, averageScore: u.level?.averageScore || 0, totalScore: u.level?.totalScore || 0, quizzesPlayed: u.level?.quizzesPlayed || 0 },
            monthly: { accuracy: u.monthlyProgress?.accuracy || 0, rewardEligible: true }
        }));

        return NextResponse.json({ success: true, data: { month, top } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
