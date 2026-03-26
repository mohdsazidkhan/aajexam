import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 20;
        const page = parseInt(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        const query = { isActive: true, status: 'approved' };
        const quizzesRaw = await Quiz.find(query)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .select('title description level difficulty attemptsCount questionCount timeLimit stats category subcategory')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // For each quiz, count the questions
        const quizzes = await Promise.all(quizzesRaw.map(async (quiz) => {
            const count = await Question.countDocuments({ quiz: quiz._id });
            return {
                ...quiz,
                questionCount: count
            };
        }));

        const total = await Quiz.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: {
                quizzes,
                pagination: {
                    currentPage: page,
                    limit,
                    totalQuizzes: total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: skip + quizzes.length < total
                }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
