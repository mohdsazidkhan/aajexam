import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import { protect } from '@/middleware/auth';
import jwt from 'jsonwebtoken';

// This route handles both home page quizzes (GUEST/STUDENT) and level-based quizzes (STUDENT)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 20;
        const page = parseInt(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        // Filters for level-based page
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const difficulty = searchParams.get('difficulty');
        const requestedLevel = searchParams.get('level');
        const attemptedFilter = searchParams.get('attempted');
        const search = searchParams.get('search');

        // Auth check (optional for home, required for level-based page)
        let currentUser = null;
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                currentUser = await User.findById(decoded.id);
            } catch (e) { /* Invalid token */ }
        }

        const currentLevel = currentUser?.level?.currentLevel || 0;
        const targetLevel = requestedLevel ? parseInt(requestedLevel) : (currentLevel === 10 ? 10 : currentLevel + 1);

        // If a specific level is requested, check access
        if (requestedLevel && currentUser) {
            const access = currentUser.canAccessLevel(targetLevel);
            if (!access.canAccess) {
                return NextResponse.json({
                    success: false,
                    message: `You need a ${access.requiredPlan} subscription to access level ${targetLevel}`,
                    requiredPlan: access.requiredPlan
                }, { status: 403 });
            }
        }

        // Build query
        let query = { isActive: true, requiredLevel: targetLevel };
        if (category) query.category = category;
        if (subcategory) query.subcategory = subcategory;
        if (difficulty) query.difficulty = difficulty;

        if (search) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ title: regex }, { description: regex }];
        }

        if (currentUser) {
            const attemptedIds = await QuizAttempt.find({ user: currentUser._id }).distinct('quiz');
            if (attemptedFilter === 'attempted') {
                query._id = { $in: attemptedIds };
            } else {
                query._id = { $nin: attemptedIds };
            }
        }

        const allMatchedQuizzes = await Quiz.find(query)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 });

        // Randomize for discovery
        const shuffled = allMatchedQuizzes.sort(() => Math.random() - 0.5);
        const paginated = shuffled.slice(skip, skip + limit);

        const quizzesWithStatus = await Promise.all(paginated.map(async (q) => {
            let status = { canAttempt: true, attemptsLeft: 1, attemptNumber: 1, bestScore: null };
            if (currentUser) {
                const res = await currentUser.canAttemptQuiz(q._id);
                status = {
                    hasAttempted: !res.canAttempt,
                    canAttempt: res.canAttempt,
                    bestScore: res.bestScore,
                    isHighScore: res.isHighScore
                };
            }
            return {
                ...q.toObject(),
                isRecommended: q.requiredLevel === targetLevel,
                attemptStatus: status
            };
        }));

        return NextResponse.json({
            success: true,
            data: quizzesWithStatus,
            userLevel: currentUser ? {
                currentLevel: currentUser.level.currentLevel,
                nextLevel: currentUser.level.currentLevel + 1,
                levelName: currentUser.level.levelName,
                progress: currentUser.level.levelProgress,
                highScoreQuizzes: currentUser.level.highScoreQuizzes,
                totalQuizzesPlayed: currentUser.level.quizzesPlayed
            } : null,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(allMatchedQuizzes.length / limit),
                totalQuizzes: allMatchedQuizzes.length
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
