import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Subcategory from '@/models/Subcategory';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        // Parse pagination query params
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const subcategory = await Subcategory.findById(id).populate('category', 'name').lean();

        if (!subcategory) {
            return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });
        }

        const quizzes = await Quiz.find({ subcategory: id, isActive: true })
            .select('title description difficulty timeLimit level stats questionCount attemptsCount category')
            .populate('category', 'name')
            .skip(skip)
            .limit(limit)
            .lean();

        const totalQuizzes = await Quiz.countDocuments({ subcategory: id, isActive: true });

        // Enhance quizzes with stats fallback if needed
        const enhancedQuizzes = quizzes.map(q => ({
            ...q,
            stats: q.stats || { averageScore: 0 }
        }));

        return NextResponse.json({
            success: true,
            data: {
                subcategory,
                quizzes: enhancedQuizzes,
                pagination: {
                    page,
                    limit,
                    totalQuizzes,
                    totalPages: Math.ceil(totalQuizzes / limit) || 1,
                    hasPrev: page > 1,
                    hasNext: (page * limit) < totalQuizzes
                }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
