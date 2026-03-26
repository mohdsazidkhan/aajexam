import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { userId } = await params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
        }

        const objectIdUserId = new mongoose.Types.ObjectId(userId);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const currentCount = await UserQuestions.countDocuments({
            userId: objectIdUserId,
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        const dailyLimit = 5;
        const remaining = Math.max(0, dailyLimit - currentCount);

        return NextResponse.json({
            success: true,
            data: {
                currentCount,
                limit: dailyLimit,
                remaining,
                canAddMore: currentCount < dailyLimit
            }
        });
    } catch (error) {
        console.error('Error fetching daily question count:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch count',
            error: error.message
        }, { status: 500 });
    }
}
