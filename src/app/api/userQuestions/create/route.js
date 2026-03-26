import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import { protect, proOnly } from '@/middleware/auth';
import mongoose from 'mongoose';

const getCount = async (userId, type) => {
    const now = new Date();
    const start = type === 'day'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth(), 1);

    return await UserQuestions.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: start }
    });
};

export async function POST(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) {
            return NextResponse.json({ success: false, message: 'Pro subscription required' }, { status: 403 });
        }

        const { questionText, options, correctOptionIndex } = await req.json();
        const userId = auth.user.id;

        // Limit checks
        const dailyLimit = parseInt(process.env.DAILY_QUESTION_LIMIT) || 5;
        const dayCount = await getCount(userId, 'day');
        if (dayCount >= dailyLimit) {
            return NextResponse.json({ success: false, message: `Daily limit of ${dailyLimit} questions reached` }, { status: 429 });
        }

        const monthlyLimit = parseInt(process.env.MONTHLY_QUESTION_LIMIT) || 100;
        const monthCount = await getCount(userId, 'month');
        if (monthCount >= monthlyLimit) {
            return NextResponse.json({ success: false, message: `Monthly limit of ${monthlyLimit} questions reached` }, { status: 429 });
        }

        const doc = await UserQuestions.create({
            userId,
            questionText: questionText.trim(),
            options: options.map(o => o.trim()),
            correctOptionIndex,
            status: 'pending'
        });

        return NextResponse.json({ success: true, data: doc, message: 'Question submitted for approval' }, { status: 201 });
    } catch (error) {
        console.error('createUserQuestion error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
