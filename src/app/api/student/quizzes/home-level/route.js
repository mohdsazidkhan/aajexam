import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import User from '@/models/User';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
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

        const currentLevel = user.monthlyProgress?.currentLevel || 0;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 6;

        let targetLevel;
        if (currentLevel === 0) {
            targetLevel = 1;
        } else if (currentLevel === 10) {
            targetLevel = 10;
        } else {
            targetLevel = currentLevel + 1;
        }

        const levelAccess = user.canAccessLevel(targetLevel);

        if (!levelAccess.canAccess) {
            return NextResponse.json({
                message: `You need a ${levelAccess.requiredPlan} subscription to access level ${targetLevel} quizzes`,
                requiredPlan: levelAccess.requiredPlan,
                accessibleLevels: levelAccess.accessibleLevels
            }, { status: 403 });
        }

        const attemptedQuizIds = await QuizAttempt.find({ user: userId }).distinct('quiz');

        let query = {
            isActive: true,
            requiredLevel: targetLevel,
            _id: { $nin: attemptedQuizIds },
            $or: [
                { createdType: 'admin' },
                { createdType: { $exists: false } },
                { createdType: null },
                {
                    createdType: 'user',
                    status: 'approved',
                    createdBy: { $ne: userId }
                }
            ]
        };

        const quizzes = await Quiz.find(query)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);

        const shuffledQuizzes = quizzes.sort(() => Math.random() - 0.5);

        const quizzesWithStatus = shuffledQuizzes.map(quiz => ({
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            subcategory: quiz.subcategory,
            difficulty: quiz.difficulty,
            requiredLevel: quiz.requiredLevel,
            timeLimit: quiz.timeLimit,
            totalMarks: quiz.totalMarks,
            isRecommended: quiz.requiredLevel === targetLevel,
            levelMatch: {
                exact: quiz.requiredLevel === targetLevel,
                withinRange: quiz.requiredLevel >= Math.max(0, targetLevel - 1) &&
                    quiz.requiredLevel <= Math.min(10, targetLevel + 1)
            },
            attemptStatus: {
                hasAttempted: false,
                canAttempt: true,
                bestScore: null,
                isHighScore: false,
                attemptedAt: null,
                attemptId: null
            }
        }));

        return NextResponse.json({
            success: true,
            data: quizzesWithStatus,
            userLevel: {
                currentLevel: currentLevel,
                nextLevel: targetLevel,
                levelName: user.monthlyProgress?.levelName || 'Rookie',
                progress: user.monthlyProgress?.levelProgress || 0,
                highScoreQuizzes: user.monthlyProgress?.highScoreQuizzes || 0,
                totalQuizzesPlayed: user.monthlyProgress?.totalQuizAttempts || 0
            },
            levelAccess: {
                accessibleLevels: levelAccess.accessibleLevels,
                userPlan: levelAccess.userPlan || 'free'
            }
        });
    } catch (err) {
        console.error('Error fetching home page level quizzes:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
