import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQuestions from '@/models/UserQuestions';
import User from '@/models/User';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { userId } = params;

        const [totalContributions, approvedContributions, rejectedContributions, pendingContributions] = await Promise.all([
            UserQuestions.countDocuments({ userId }),
            UserQuestions.countDocuments({ userId, status: 'approved' }),
            UserQuestions.countDocuments({ userId, status: 'rejected' }),
            UserQuestions.countDocuments({ userId, status: 'pending' })
        ]);

        const totalPoints = approvedContributions * 10; // Simple points logic

        return NextResponse.json({
            success: true,
            data: {
                totalContributions,
                approvedContributions,
                rejectedContributions,
                pendingContributions,
                totalPoints
            }
        });
    } catch (error) {
        console.error('Pro User stats error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
