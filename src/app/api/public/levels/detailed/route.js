import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Level from '@/models/Level';
import Quiz from '@/models/Quiz';

export async function GET() {
    try {
        await dbConnect();
        
        const levels = await Level.find({ isActive: true }).sort({ levelNumber: 1 });
        
        // Enhance levels with quiz counts
        const enhancedLevels = await Promise.all(levels.map(async (level) => {
            const quizCount = await Quiz.countDocuments({ 
                levelNumber: level.levelNumber, 
                status: 'approved' 
            });
            return {
                ...level.toObject(),
                level: level.levelNumber, // Mobile parity
                quizCount
            };
        }));

        return NextResponse.json({
            success: true,
            data: enhancedLevels
        });
    } catch (error) {
        console.error('Detailed levels error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
