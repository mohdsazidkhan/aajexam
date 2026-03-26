import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();

        const authRecord = await protect(req);
        if (!authRecord.authenticated) {
            return NextResponse.json({ message: authRecord.message || 'Unauthorized' }, { status: 401 });
        }
        const userId = authRecord.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        await user.updateLevel();
        await user.save();

        const userLevel = user.monthlyProgress?.currentLevel || 0;
        const targetLevel = userLevel === 10 ? 10 : userLevel;

        // Get difficulty distribution for user's level
        const difficultyStats = await Quiz.aggregate([
            {
                $match: {
                    isActive: true,
                    requiredLevel: targetLevel
                }
            },
            {
                $group: {
                    _id: '$difficulty',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get level distribution
        const levelStats = await Quiz.aggregate([
            {
                $match: {
                    isActive: true,
                    requiredLevel: targetLevel
                }
            },
            {
                $group: {
                    _id: '$requiredLevel',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return NextResponse.json({
            success: true,
            difficultyDistribution: difficultyStats,
            levelDistribution: levelStats,
            userLevel: {
                currentLevel: userLevel,
                levelName: user.monthlyProgress?.levelName || 'Rookie'
            }
        });
    } catch (err) {
        console.error('Error fetching quiz distribution:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
