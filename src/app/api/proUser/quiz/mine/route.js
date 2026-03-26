import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const authResult = await protect(req);
        if (!authResult.authenticated) {
            return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
        }
        const userId = authResult.user.id;

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        const filter = {
            createdBy: userId,
            createdType: 'user'
        };

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Quiz.find(filter)
                .populate('category', 'name')
                .populate('subcategory', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Quiz.countDocuments(filter)
        ]);

        const quizIds = items.map(q => q._id);
        const questionCounts = await Question.aggregate([
            { $match: { quiz: { $in: quizIds } } },
            { $group: { _id: '$quiz', count: { $sum: 1 } } }
        ]);

        const questionCountMap = {};
        questionCounts.forEach(qc => {
            if (qc && qc._id) {
                questionCountMap[qc._id.toString()] = qc.count;
            }
        });

        const itemsWithQuestionCount = items.map(quiz => {
            const quizId = quiz._id?.toString() || '';
            return {
                ...quiz.toObject(),
                questionCount: quizId ? (questionCountMap[quizId] || 0) : 0
            };
        });

        return NextResponse.json({
            success: true,
            data: itemsWithQuestionCount,
            pagination: {
                page: page,
                limit: limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('listMyQuizzes error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
