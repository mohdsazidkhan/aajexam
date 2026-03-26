import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import { protect, proOnly } from '@/middleware/auth';
import dayjs from 'dayjs';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const userId = auth.user.id;

        // Get total approved quizzes
        const totalApproved = await Quiz.countDocuments({
            createdBy: userId,
            createdType: 'user',
            status: 'approved'
        });

        // Get monthly count
        const startOfMonth = dayjs().startOf('month').toDate();
        const endOfMonth = dayjs().endOf('month').toDate();

        const monthlyCount = await Quiz.countDocuments({
            createdBy: userId,
            createdType: 'user',
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const monthlyLimit = parseInt(process.env.MONTHLY_USER_MAX_QUIZ_LIMIT) || 30;
        const monthlyRemaining = Math.max(0, monthlyLimit - monthlyCount);
        const rewardPerQuiz = parseInt(process.env.PER_USER_QUIZ_CREDIT_AMOUNT) || 5;

        return NextResponse.json({
            success: true,
            data: {
                totalApproved,
                monthlyCount,
                monthlyLimit,
                monthlyRemaining,
                canCreateMore: monthlyCount < monthlyLimit,
                rewardPerQuiz,
                potentialEarnings: monthlyRemaining * rewardPerQuiz
            }
        });
    } catch (error) {
        console.error('getQuizCreationStats error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
