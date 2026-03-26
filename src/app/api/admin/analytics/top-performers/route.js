import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'monthly'; // daily, weekly, monthly
        const limit = parseInt(searchParams.get('limit')) || 20;

        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);
        const currentDate = now.toISOString().slice(0, 10);
        
        // Calculate Week Number
        const oneJan = new Date(now.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
        const currentWeek = `${now.getFullYear()}-W${weekNum}`;

        let matchQuery = { role: 'student' };
        let progressPath = 'monthlyProgress';

        if (type === 'daily') {
            matchQuery['dailyProgress.date'] = currentDate;
            progressPath = 'dailyProgress';
        } else if (type === 'weekly') {
            matchQuery['weeklyProgress.week'] = currentWeek;
            progressPath = 'weeklyProgress';
        } else {
            matchQuery['monthlyProgress.month'] = currentMonth;
        }

        const sortCriteria = {
            [`${progressPath}.highScoreWins`]: -1,
            [`${progressPath}.accuracy`]: -1,
            [`${progressPath}.totalCorrectAnswers`]: -1,
            [`${progressPath}.totalQuizAttempts`]: -1
        };

        const topUsers = await User.find(matchQuery)
            .select(`name email level ${progressPath} subscriptionStatus`)
            .sort(sortCriteria)
            .limit(limit)
            .lean();


        const formattedPerformers = topUsers.map(u => {
            const progress = u[progressPath] || {};
            return {
                _id: u._id,
                name: u.name,
                email: u.email,
                subscriptionStatus: u.subscriptionStatus,
                level: {
                    currentLevel: progress.currentLevel || 0,
                    levelName: progress.levelName || 'Starter',
                    highScoreQuizzes: progress.highScoreWins || 0,
                    quizzesPlayed: progress.totalQuizAttempts || 0,
                    accuracy: progress.accuracy || 0,
                    totalScore: progress.totalCorrectAnswers || 0
                },
                progress: {
                    highScoreWins: progress.highScoreWins || 0,
                    accuracy: progress.accuracy || 0,
                    totalQuizAttempts: progress.totalQuizAttempts || 0,
                    period: progress.date || progress.week || progress.month
                },
                totalScore: progress.totalCorrectAnswers || 0,
                totalCorrectAnswers: progress.totalCorrectAnswers || 0
            };
        });

        return NextResponse.json({
            success: true,
            data: formattedPerformers
        });

    } catch (error) {
        console.error('Top Performers Analytics Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
