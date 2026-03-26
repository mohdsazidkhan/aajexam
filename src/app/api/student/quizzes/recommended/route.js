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

        // Require authentication
        const authRecord = await protect(req);
        if (!authRecord.authenticated) {
            return NextResponse.json({ message: authRecord.message || 'Unauthorized' }, { status: 401 });
        }
        const userId = authRecord.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Ensure level progress is calculated correctly
        await user.updateLevel();
        await user.save();

        const currentLevel = user.monthlyProgress?.currentLevel || 0;

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 5;

        // Determine target level for quiz display
        let targetLevel;
        if (currentLevel === 0) {
            targetLevel = 1;
        } else if (currentLevel === 10) {
            targetLevel = 10;
        } else {
            targetLevel = currentLevel + 1;
        }

        // Get attempted quiz IDs for this user
        const attemptedQuizIds = await QuizAttempt.find({ user: userId }).distinct('quiz');

        // Get quizzes for target level (excluding attempted ones)
        const recommendedQuizzes = await Quiz.find({
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
        })
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);

        const quizzesWithStatus = recommendedQuizzes.map(quiz => ({
            ...quiz.toObject(),
            hasAttempted: false,
            canAttempt: true
        }));

        return NextResponse.json({
            success: true,
            data: quizzesWithStatus,
            userLevel: {
                currentLevel: currentLevel,
                nextLevel: targetLevel,
                levelName: user.monthlyProgress?.levelName || 'Rookie'
            }
        });
    } catch (err) {
        console.error('Error fetching recommended quizzes:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
