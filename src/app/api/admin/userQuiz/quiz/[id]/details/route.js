import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import { protect, admin } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid quiz ID' }, { status: 400 });
        }

        await dbConnect();

        const quiz = await Quiz.findOne({
            _id: id,
            createdType: 'user'
        })
            .populate('createdBy', 'name email level.currentLevel')
            .populate('category', 'name')
            .populate('subcategory', 'name');

        if (!quiz) {
            return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
        }

        // Get questions
        const questions = await Question.find({ quiz: id });

        return NextResponse.json({
            success: true,
            data: {
                ...quiz.toObject(),
                questions
            }
        });
    } catch (error) {
        console.error('Get quiz details error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}
