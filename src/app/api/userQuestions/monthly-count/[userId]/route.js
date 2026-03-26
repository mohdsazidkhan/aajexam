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
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const currentCount = await UserQuestions.countDocuments({
            userId: objectIdUserId,
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });

        const monthlyLimit = 100;
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
        console.error('Error fetching monthly question count:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch count',
            error: error.message
        }, { status: 500 });
    }
}
