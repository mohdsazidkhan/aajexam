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
        const startOfMonth = dayjs().startOf('month').toDate();
        const endOfMonth = dayjs().endOf('month').toDate();

        const currentCount = await Quiz.countDocuments({
            createdBy: userId,
            createdType: 'user',
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const monthlyLimit = parseInt(process.env.MONTHLY_USER_MAX_QUIZ_LIMIT) || 30;
        const remaining = Math.max(0, monthlyLimit - currentCount);

        return NextResponse.json({
            success: true,
            data: {
                currentCount,
                limit: monthlyLimit,
                remaining,
                canAddMore: currentCount < monthlyLimit
            }
        });
    } catch (error) {
        console.error('getMonthlyQuizCount error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
