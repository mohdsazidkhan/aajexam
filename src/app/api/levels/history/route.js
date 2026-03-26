import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        const user = await User.findById(auth.user.id);

        // Fetch all quiz attempts for user and then filter/paginate
        let quizAttempts = await QuizAttempt.find({ user: auth.user.id })
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
            const s = search.toLowerCase();
            quizAttempts = quizAttempts.filter(a =>
                (a.quiz?.title?.toLowerCase().includes(s)) ||
                (a.quiz?.category?.name?.toLowerCase().includes(s)) ||
                (a.quiz?.subcategory?.name?.toLowerCase().includes(s))
            );
        }

        const total = quizAttempts.length;
        const paginated = quizAttempts.slice(skip, skip + limit).map(a => ({
            ...a,
            quizTitle: a.quiz?.title || 'Unknown Quiz',
            categoryName: a.quiz?.category?.name || 'Unknown Category',
            subcategoryName: a.quiz?.subcategory?.name || 'Unknown Subcategory',
            totalQuestions: a.quiz?.questions?.length || 0,
            percentage: a.scorePercentage || 0
        }));

        return NextResponse.json({
            success: true,
            data: {
                attempts: paginated,
                pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalAttempts: total },
                currentLevel: await user.getLevelInfo()
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
