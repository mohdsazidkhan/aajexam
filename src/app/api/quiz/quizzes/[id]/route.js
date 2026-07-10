import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';

// GET - public: single quiz detail (without correct answers)
export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const isObjectId = mongoose.Types.ObjectId.isValid(id) && (new String(id).length === 24);
        const query = isObjectId ? { _id: id } : { slug: id };

        const quiz = await Quiz.findOne({ ...query, status: 'published' })
            .populate('applicableExams', 'name code')
            .populate('subject', 'name')
            .populate('topic', 'name')
            .populate({
                path: 'questions',
                match: { isActive: true },
                select: 'questionText options.text difficulty image'
            });

        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: quiz });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
