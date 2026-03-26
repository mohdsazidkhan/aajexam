import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import Question from '@/models/Question';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(auth.user.id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        await user.updateLevel();
        await user.save();

        const currentLevel = user.monthlyProgress?.currentLevel;
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const difficulty = searchParams.get('difficulty');
        const limit = parseInt(searchParams.get('limit')) || 20;
        const page = parseInt(searchParams.get('page')) || 1;

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

        let query = {
            isActive: true,
            requiredLevel: targetLevel,
            $or: [
                { createdType: 'admin' },
                { createdType: { $exists: false } },
                { createdType: null },
                {
                    createdType: 'user',
                    status: 'approved',
                    createdBy: { $ne: auth.user.id }
                }
            ]
        };

        if (category?.trim()) query.category = category;
        if (subcategory?.trim()) query.subcategory = subcategory;
        if (['beginner', 'intermediate', 'advanced', 'expert'].includes(difficulty)) {
            query.difficulty = difficulty;
        }

        const allQuizzes = await Quiz.find(query)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 });

        const shuffledQuizzes = allQuizzes.sort(() => Math.random() - 0.5);
        const attemptedQuizIds = await QuizAttempt.find({ user: auth.user.id }).distinct('quiz');
        const attemptedQuizIdStrings = attemptedQuizIds.map(id => id.toString());

        const filteredQuizzes = shuffledQuizzes.filter(
            quiz => !attemptedQuizIdStrings.includes(quiz._id.toString())
        );

        const quizIds = filteredQuizzes.map(q => q._id);
        const questionCounts = await Question.aggregate([
            { $match: { quiz: { $in: quizIds } } },
            { $group: { _id: '$quiz', count: { $sum: 1 } } }
        ]);
        const questionCountMap = {};
        questionCounts.forEach(qc => {
            questionCountMap[qc._id.toString()] = qc.count;
        });

        const filteredCount = filteredQuizzes.length;
        const totalPages = Math.ceil(filteredCount / limit);
        const skip = (page - 1) * limit;
        const paginatedQuizzes = filteredQuizzes.slice(skip, skip + limit);

        const quizzesWithAttemptStatus = paginatedQuizzes.map(quiz => {
            const attemptStatus = user.getQuizAttemptStatus(quiz._id);
            return {
                ...quiz.toObject(),
                attemptStatus: {
                    hasAttempted: attemptStatus.hasAttempted,
                    attemptsLeft: attemptStatus.attemptsLeft,
                    bestScore: attemptStatus.bestScore,
                    isHighScore: attemptStatus.isHighScore,
                    canAttempt: attemptStatus.canAttempt,
                    attemptsUsed: attemptStatus.attemptsUsed || 0
                },
                isRecommended: quiz.requiredLevel === targetLevel,
                levelMatch: {
                    exact: quiz.requiredLevel === targetLevel,
                    withinRange: true
                },
                questionCount: questionCountMap[quiz._id.toString()] || 0
            };
        });

        return NextResponse.json({
            success: true,
            data: quizzesWithAttemptStatus,
            pagination: {
                currentPage: page,
                totalPages,
                totalQuizzes: filteredCount,
                hasNextPage: skip + paginatedQuizzes.length < filteredCount,
                hasPrevPage: page > 1
            },
            userLevel: {
                currentLevel: currentLevel,
                nextLevel: targetLevel,
                levelName: user.monthlyProgress?.levelName,
                progress: user.monthlyProgress.levelProgress
            }
        });
    } catch (err) {
        console.error('Error fetching quizzes by level:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
