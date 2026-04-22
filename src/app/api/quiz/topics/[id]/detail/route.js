import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Topic from '@/models/Topic';
import Quiz from '@/models/Quiz';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const topic = await Topic.findById(id)
            .populate('subject', 'name')
            .lean();
        if (!topic) return NextResponse.json({ success: false, message: 'Topic not found' }, { status: 404 });

        // Quizzes for this topic
        const quizzes = await Quiz.find({ topic: id, status: 'published' })
            .populate('subject', 'name')
            .populate('applicableExams', 'name code')
            .select('-questions')
            .sort({ publishedAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            topic,
            quizzes,
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
