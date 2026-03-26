import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
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
        const userId = auth.user.id;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const skip = (page - 1) * limit;

        let quizAttempts = await QuizAttempt.find({ user: userId })
            .populate({
                path: 'quiz',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'subcategory', select: 'name' }
                ]
            })
            .sort({ attemptedAt: -1 })
            .lean();

        if (search) {
            const searchLower = search.toLowerCase();
            quizAttempts = quizAttempts.filter(attempt => {
                const quizTitle = attempt.quiz?.title?.toLowerCase() || '';
                const categoryName = attempt.quiz?.category?.name?.toLowerCase() || '';
                const subcategoryName = attempt.quiz?.subcategory?.name?.toLowerCase() || '';
                return quizTitle.includes(searchLower) ||
                    categoryName.includes(searchLower) ||
                    subcategoryName.includes(searchLower);
            });
        }

        const total = quizAttempts.length;
        const paginatedAttempts = quizAttempts.slice(skip, skip + limit);

        const attemptsWithLevel = paginatedAttempts.map(attempt => {
            return {
                ...attempt,
                quizTitle: attempt.quiz?.title || 'Unknown Quiz',
                categoryName: attempt.quiz?.category?.name || 'Unknown Category',
                subcategoryName: attempt.quiz?.subcategory?.name || 'Unknown Subcategory',
                totalQuestions: attempt.quiz?.questions?.length || 0,
                percentage: attempt.scorePercentage || 0
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                attempts: attemptsWithLevel,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalAttempts: total,
                    hasNextPage: skip + paginatedAttempts.length < total,
                    hasPrevPage: page > 1,
                    limit: limit
                },
                currentLevel: await user.getLevelInfo()
            }
        });

    } catch (error) {
        console.error('Quiz history fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
