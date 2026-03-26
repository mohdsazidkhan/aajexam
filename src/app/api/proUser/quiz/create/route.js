import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { protect, proOnly } from '@/middleware/auth';
import { createNotification } from '@/utils/notifications';
import mongoose from 'mongoose';
import dayjs from 'dayjs';

export async function POST(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const userId = auth.user.id;
        const { title, description, categoryId, subcategoryId, difficulty, requiredLevel, timeLimit, questions } = await req.json();

        // Limit check
        const monthlyLimit = parseInt(process.env.MONTHLY_USER_MAX_QUIZ_LIMIT) || 30;
        const startOfMonth = dayjs().startOf('month').toDate();
        const count = await Quiz.countDocuments({
            createdBy: userId,
            createdType: 'user',
            createdAt: { $gte: startOfMonth }
        });

        if (count >= monthlyLimit) {
            return NextResponse.json({
                success: false,
                message: `Monthly limit of ${monthlyLimit} quizzes reached`,
                error: 'MONTHLY_LIMIT_EXCEEDED'
            }, { status: 429 });
        }

        // Validation
        if (!title || title.trim().length < 10) {
            return NextResponse.json({ success: false, message: 'Title must be at least 10 characters' }, { status: 400 });
        }
        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ success: false, message: 'Invalid category' }, { status: 400 });
        }
        if (!subcategoryId || !mongoose.Types.ObjectId.isValid(subcategoryId)) {
            return NextResponse.json({ success: false, message: 'Invalid subcategory' }, { status: 400 });
        }
        if (!Array.isArray(questions) || questions.length < 5 || questions.length > 10) {
            return NextResponse.json({ success: false, message: 'Quiz must have 5-10 questions' }, { status: 400 });
        }

        // Validate category & subcategory existence/approval
        const category = await Category.findOne({
            _id: categoryId,
            $or: [
                { createdType: 'admin' },
                { createdType: 'user', status: 'approved' },
                { createdType: { $exists: false } }
            ]
        });
        if (!category) return NextResponse.json({ success: false, message: 'Category not valid or not approved' }, { status: 404 });

        const subcategory = await Subcategory.findOne({
            _id: subcategoryId,
            category: categoryId,
            $or: [
                { createdType: 'admin' },
                { createdType: 'user', status: 'approved' },
                { createdType: { $exists: false } }
            ]
        });
        if (!subcategory) return NextResponse.json({ success: false, message: 'Subcategory not valid or not approved for this category' }, { status: 404 });

        // Add timestamp to title if needed
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const finalTitle = title.trim().endsWith(String(currentTimestamp)) ? title.trim() : `${title.trim()}-${currentTimestamp}`;

        // Create quiz
        const quiz = await Quiz.create({
            title: finalTitle,
            description: description?.trim() || '',
            category: categoryId,
            subcategory: subcategoryId,
            difficulty,
            requiredLevel: requiredLevel || 1,
            timeLimit: timeLimit || 3,
            totalMarks: questions.length,
            createdBy: userId,
            createdType: 'user',
            status: 'pending',
            isActive: true
        });

        // Create questions
        const questionDocs = questions.map(q => ({
            questionText: q.questionText.trim(),
            quiz: quiz._id,
            options: q.options.map(opt => opt.trim()),
            correctAnswerIndex: q.correctAnswerIndex,
            timeLimit: q.timeLimit || 30
        }));

        await Question.insertMany(questionDocs);

        // Notify admin
        try {
            createNotification({
                userId,
                type: 'quiz',
                title: 'New quiz submitted for approval',
                description: `${title.trim()} by user`,
                meta: { quizId: quiz._id, status: 'pending' }
            });
        } catch (notifyError) {
            console.error('Failed to create notification:', notifyError);
        }

        return NextResponse.json({
            success: true,
            data: quiz,
            message: 'Quiz created successfully and submitted for admin approval'
        }, { status: 201 });
    } catch (error) {
        console.error('createUserQuiz error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
