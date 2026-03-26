import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Level from '@/models/Level';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        await dbConnect();

        // Ensure parameters are resolved
        const { id: levelId } = await params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(levelId)) {
            return NextResponse.json({ success: false, message: 'Invalid level ID' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        // Get level details
        const level = await Level.findById(levelId)
            .select('levelNumber name description emoji educationalContent methodology examsCovered preparationTips')
            .lean();

        if (!level) {
            return NextResponse.json({
                success: false,
                message: 'Level not found'
            }, { status: 404 });
        }

        // Get quizzes for this level (without questions)
        const quizzes = await Quiz.find({
            level: levelId,
            isActive: { $in: [true, undefined] } // Match legacy logic
        })
            .select('title description category subcategory difficulty timeLimit tags educationalDescription syllabusCovered learningOutcomes examRelevance sampleQuestions createdAt')
            .populate('category', 'name description')
            .populate('subcategory', 'name description')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Count total questions for each quiz
        const quizIds = quizzes.map(q => q._id);
        const questionCounts = await Question.aggregate([
            { $match: { quiz: { $in: quizIds } } },
            { $group: { _id: '$quiz', count: { $sum: 1 } } }
        ]);
        const quizIdToCount = new Map(questionCounts.map(q => [String(q._id), q.count]));

        // Enhance quizzes with question counts
        const enhancedQuizzes = quizzes.map(quiz => ({
            ...quiz,
            totalQuestions: quizIdToCount.get(String(quiz._id)) || 0
        }));

        const total = await Quiz.countDocuments({
            level: levelId,
            isActive: { $in: [true, undefined] }
        });

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
                level,
                quizzes: enhancedQuizzes,
                pagination: {
                    page: page,
                    limit: limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching quizzes by level:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch quizzes',
            error: error.message
        }, { status: 500 });
    }
}
