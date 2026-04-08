import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        const user = await User.findById(auth.user.id);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const currentLevel = user.level?.currentLevel || 0;
        const targetLevel = (currentLevel === 0) ? 1 :
            (currentLevel === 10) ? 10 :
                currentLevel + 1;

        // Check level access
        const levelAccess = user.canAccessLevel(targetLevel);
        if (!levelAccess.canAccess) {
            return NextResponse.json({
                message: `You need a ${levelAccess.requiredPlan} subscription to access level ${targetLevel}`,
                requiredPlan: levelAccess.requiredPlan,
                accessibleLevels: levelAccess.accessibleLevels
            }, { status: 403 });
        }

        const topPerformers = await User.find({ role: 'student' })
            .select('name badges subscriptionStatus level')
            .sort({ 'level.currentLevel': -1 })
            .limit(5);

        return NextResponse.json({
            success: true,
            data: {},
            userLevel: {
                currentLevel,
                nextLevel: targetLevel,
                levelName: user.level?.levelName || 'Starter',
                progress: 0,
                highScoreQuizzes: 0,
                totalQuizzesPlayed: 0
            },
            levelAccess: {
                accessibleLevels: levelAccess.accessibleLevels,
                userPlan: levelAccess.userPlan
            },
            topPerformers,
            recentWinners: null
        });

    } catch (error) {
        console.error('HomePage data fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
