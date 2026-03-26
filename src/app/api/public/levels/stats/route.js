import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Level from '@/models/Level';
import Quiz from '@/models/Quiz';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();
        
        const [totalLevels, totalQuizzes, totalUsers] = await Promise.all([
            Level.countDocuments({ isActive: true }),
            Quiz.countDocuments({ status: 'approved' }),
            User.countDocuments({ role: 'student' })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalLevels,
                totalQuizzes,
                totalUsers
            }
        });
    } catch (error) {
        console.error('Level stats error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
