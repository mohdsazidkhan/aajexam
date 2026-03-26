import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Quiz from '@/models/Quiz';

export async function GET() {
    try {
        await dbConnect();
        const levels = [];
        const config = User.LEVEL_CONFIG;

        for (let i = 0; i <= 10; i++) {
            const quizCount = await Quiz.countDocuments({ requiredLevel: i, isActive: true });
            levels.push({
                level: i,
                name: config[i].name,
                description: config[i].description,
                quizzesRequired: config[i].quizzesRequired,
                quizCount,
                emoji: i === 10 ? '🔟' : `${i}️⃣` // Simplified emoji helper
            });
        }

        return NextResponse.json({ success: true, data: levels });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
