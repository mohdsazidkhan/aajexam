import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import User from '@/models/User';
import Article from '@/models/Article';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'monthly';
        const date = searchParams.get('date');
        const week = searchParams.get('week');

        const user = await User.findById(auth.user.id);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        // Ensure level is correct only for current data
        if (!date && !week) {
            await user.updateLevel();
            await user.save();
        }

        const filterValue = type === 'daily' ? date : (type === 'weekly' ? week : null);
        const levelInfo = await User.getHistoricalLevelInfo(user._id, type, filterValue);
        const competitionLevel = await User.getHistoricalCompetitionLevel(user._id, type, filterValue);

        if (!levelInfo && filterValue) {
            return NextResponse.json({ error: `No historical data found for ${type} ${filterValue}` }, { status: 404 });
        }

        const currentLevel = competitionLevel.currentLevel;
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

        // Fetch required homepage data
        const categories = await Category.find().limit(10);
        const subcategories = await Subcategory.find()
            .populate('category', 'name')
            .sort({ name: 1 });

        const topPerformers = await User.find({ role: 'student' })
            .select('name dailyProgress weeklyProgress monthlyProgress badges subscriptionStatus')
            .sort({ 'monthlyProgress.currentLevel': -1, 'monthlyProgress.totalScore': -1 })
            .limit(5);

        const latestArticles = await Article.find({ status: 'published' })
            .sort({ createdAt: -1 })
            .limit(4);

        const progress = type === 'daily' ? user.dailyProgress :
                        (type === 'weekly' ? user.weeklyProgress : user.monthlyProgress);

        return NextResponse.json({
            success: true,
            data: {
                categories,
                subcategories
            },
            userLevel: {
                currentLevel,
                nextLevel: targetLevel,
                levelName: competitionLevel.levelName,
                progress: progress?.levelProgress || 0,
                highScoreQuizzes: progress?.highScoreWins || 0,
                totalQuizzesPlayed: progress?.totalQuizAttempts || 0
            },
            levelAccess: {
                accessibleLevels: levelAccess.accessibleLevels,
                userPlan: levelAccess.userPlan
            },
            // Keep legacy fields for backward compatibility
            topPerformers,
            recentWinners: null,
            latestArticles
        });

    } catch (error) {
        console.error('HomePage data fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
