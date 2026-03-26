import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        // Remove .select filter to get all available details natively (or list them out)
        const quiz = await Quiz.findById(id)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .lean();

        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        // Retrieve Question model for count (handle dynamic model loading)
        const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({ quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' } }));
        const questionCount = await Question.countDocuments({ quiz: id });
        quiz.totalQuestions = questionCount || quiz.totalMarks || 0;

        if (quiz.requiredLevel) {
            quiz.level = {
                levelNumber: quiz.requiredLevel,
                name: `Level ${quiz.requiredLevel}`
            };
        }

        quiz.stats = {
            totalAttempts: quiz.attemptsCount || 0,
            averageScore: 0,
            highestScore: 0
        };

        return NextResponse.json({ success: true, data: quiz });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
