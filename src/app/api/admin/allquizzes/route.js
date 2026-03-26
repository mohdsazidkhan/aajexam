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
        const search = searchParams.get('search');

        let searchQuery = {};
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            searchQuery = { $or: [{ title: regex }, { description: regex }, { tags: regex }] };
        }

        const quizzes = await Quiz.find(searchQuery)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 });

        const quizIds = quizzes.map(q => q._id);
        const questionCounts = await Question.aggregate([
            { $match: { quiz: { $in: quizIds } } },
            { $group: { _id: '$quiz', count: { $sum: 1 } } }
        ]);
        const questionCountMap = {};
        questionCounts.forEach(qc => {
            questionCountMap[qc._id.toString()] = qc.count;
        });

        const quizzesWithCounts = quizzes.map(q => ({
            ...q.toObject(),
            questionCount: questionCountMap[q._id.toString()] || 0
        }));

        return NextResponse.json({
            quizzes: quizzesWithCounts,
            total: quizzes.length
        });
    } catch (error) {
        console.error('Admin all quizzes error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
