import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import Question from '@/models/Question';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import jwt from 'jsonwebtoken';

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const difficulty = searchParams.get('difficulty');
        const limit = parseInt(searchParams.get('limit')) || 20;
        const page = parseInt(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        // Optional Authentication
        let user = null;
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id);
            } catch (err) {
                // Invalid token - treat as guest
                console.error('Invalid token in public level-based API:', err.message);
            }
        }

        let targetLevel = 1;
        let currentLevel = 0;
        let userStatus = null;

        if (user) {
            // Update user level stats
            await user.updateLevel();
            await user.save();

            currentLevel = user.monthlyProgress?.currentLevel;
            targetLevel = currentLevel === 10 ? 10 : currentLevel + 1;

            // Check access (level 10 requires pro)
            const levelAccess = user.canAccessLevel(targetLevel);
            if (!levelAccess.canAccess) {
                return NextResponse.json({
                    success: false,
                    message: `You need a ${levelAccess.requiredPlan} subscription to access level ${targetLevel} quizzes`,
                    requiredPlan: levelAccess.requiredPlan,
                    accessibleLevels: levelAccess.accessibleLevels
                }, { status: 403 });
            }

            userStatus = {
                currentLevel: currentLevel,
                nextLevel: targetLevel,
                levelName: user.monthlyProgress?.levelName,
                progress: user.monthlyProgress.levelProgress
            };
        }

        // Build Query
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
                    ...(user ? { createdBy: { $ne: user._id } } : {})
                }
            ]
        };

        if (category?.trim()) query.category = category;
        if (subcategory?.trim()) query.subcategory = subcategory;
        if (['beginner', 'intermediate', 'advanced', 'expert'].includes(difficulty)) {
            query.difficulty = difficulty;
        }

        // Fetch and Shuffle
        const allQuizzes = await Quiz.find(query)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 });

        // Filter attempted quizzes if logged in
        let filteredQuizzes = allQuizzes;
        if (user) {
            const attemptedQuizIds = await QuizAttempt.find({ user: user._id }).distinct('quiz');
            const attemptedQuizIdStrings = attemptedQuizIds.map(id => id.toString());
            filteredQuizzes = allQuizzes.filter(
                quiz => !attemptedQuizIdStrings.includes(quiz._id.toString())
            );
        }

        // Shuffle
        const shuffledQuizzes = filteredQuizzes.sort(() => Math.random() - 0.5);

        // Paginate
        const totalCount = shuffledQuizzes.length;
        const paginatedQuizzes = shuffledQuizzes.slice(skip, skip + limit);

        // Get Question Counts
        const quizIds = paginatedQuizzes.map(q => q._id);
        const questionCounts = await Question.aggregate([
            { $match: { quiz: { $in: quizIds } } },
            { $group: { _id: '$quiz', count: { $sum: 1 } } }
        ]);
        const questionCountMap = {};
        questionCounts.forEach(qc => {
            questionCountMap[qc._id.toString()] = qc.count;
        });

        // Format Result
        const quizzesWithDetails = paginatedQuizzes.map(quiz => {
            const quizData = quiz.toObject();
            let attemptStatus = {
                hasAttempted: false,
                attemptsLeft: 1,
                canAttempt: true
            };

            if (user) {
                const status = user.getQuizAttemptStatus(quiz._id);
                attemptStatus = {
                    hasAttempted: status.hasAttempted,
                    attemptsLeft: status.attemptsLeft,
                    bestScore: status.bestScore,
                    isHighScore: status.isHighScore,
                    canAttempt: status.canAttempt,
                    attemptsUsed: status.attemptsUsed || 0
                };
            }

            return {
                ...quizData,
                attemptStatus,
                isRecommended: quiz.requiredLevel === targetLevel,
                questionCount: questionCountMap[quiz._id.toString()] || 0
            };
        });

        return NextResponse.json({
            success: true,
            data: quizzesWithDetails,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalQuizzes: totalCount,
                hasNextPage: skip + paginatedQuizzes.length < totalCount,
                hasPrevPage: page > 1
            },
            userLevel: userStatus,
            isGuest: !user
        });

    } catch (err) {
        console.error('Error in public level-based route:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
