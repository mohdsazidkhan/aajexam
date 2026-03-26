import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import { protect, proOnly } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid Quiz ID' }, { status: 400 });
        }

        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const quiz = await Quiz.findOne({
            _id: id,
            createdBy: auth.user.id,
            createdType: 'user'
        }).populate('category', 'name').populate('subcategory', 'name');

        if (!quiz) {
            return NextResponse.json({ success: false, message: 'Quiz not found' }, { status: 404 });
        }

        const questions = await Question.find({ quiz: id });

        return NextResponse.json({
            success: true,
            data: {
                ...quiz.toObject(),
                questions
            }
        });
    } catch (error) {
        console.error('getMyQuiz error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid Quiz ID' }, { status: 400 });
        }

        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { title, description, difficulty, timeLimit } = await req.json();

        const quiz = await Quiz.findOne({
            _id: id,
            createdBy: auth.user.id,
            createdType: 'user'
        });

        if (!quiz) {
            return NextResponse.json({ success: false, message: 'Quiz not found' }, { status: 404 });
        }

        if (quiz.status !== 'pending') {
            return NextResponse.json({ success: false, message: 'Only pending quizzes can be edited' }, { status: 403 });
        }

        if (title) quiz.title = title.trim();
        if (description !== undefined) quiz.description = description.trim();
        if (difficulty) quiz.difficulty = difficulty;
        if (timeLimit) quiz.timeLimit = timeLimit;

        await quiz.save();

        return NextResponse.json({
            success: true,
            data: quiz,
            message: 'Quiz updated successfully'
        });
    } catch (error) {
        console.error('updateUserQuiz error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid Quiz ID' }, { status: 400 });
        }

        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const quiz = await Quiz.findOne({
            _id: id,
            createdBy: auth.user.id,
            createdType: 'user'
        });

        if (!quiz) {
            return NextResponse.json({ success: false, message: 'Quiz not found' }, { status: 404 });
        }

        if (quiz.status !== 'pending') {
            return NextResponse.json({ success: false, message: 'Only pending quizzes can be deleted' }, { status: 403 });
        }

        await Question.deleteMany({ quiz: id });
        await Quiz.deleteOne({ _id: id });

        return NextResponse.json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        console.error('deleteUserQuiz error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
