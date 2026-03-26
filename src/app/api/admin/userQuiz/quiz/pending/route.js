import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const filter = { createdType: 'user', status: 'pending' };

        const [items, total] = await Promise.all([
            Quiz.find(filter)
                .populate('createdBy', 'name email level.currentLevel')
                .populate('category', 'name')
                .populate('subcategory', 'name')
                .sort({ createdAt: 1 }) // Ask for oldest first for pending items
                .skip(skip)
                .limit(limit),
            Quiz.countDocuments(filter)
        ]);

        // Get question count for each quiz
        const quizIds = items.map(q => q._id);
        const questionCounts = await Question.aggregate([
            { $match: { quiz: { $in: quizIds } } },
            { $group: { _id: '$quiz', count: { $sum: 1 } } }
        ]);

        const questionCountMap = {};
        questionCounts.forEach(qc => {
            questionCountMap[qc._id.toString()] = qc.count;
        });

        const itemsWithQuestionCount = items.map(quiz => ({
            ...quiz.toObject(),
            questionCount: questionCountMap[quiz._id.toString()] || 0
        }));

        return NextResponse.json({
            success: true,
            data: itemsWithQuestionCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('List pending quizzes error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}
