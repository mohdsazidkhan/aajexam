import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Topic from '@/models/Topic';
import Subject from '@/models/Subject';
import Quiz from '@/models/Quiz';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const topic = await Topic.findById(id)
            .populate({ path: 'subject', select: 'name exam', populate: { path: 'exam', select: 'name code' } })
            .lean();
        if (!topic) return NextResponse.json({ success: false, message: 'Topic not found' }, { status: 404 });

        // Quizzes for this topic
        const quizzes = await Quiz.find({ topic: id, status: 'published' })
            .populate('subject', 'name')
            .select('-questions')
            .sort({ publishedAt: -1 })
            .lean();

        // Practice tests from the same exam
        const examId = topic.subject?.exam?._id || topic.subject?.exam;
        let practiceTests = [];
        if (examId) {
            const patternIds = (await ExamPattern.find({ exam: examId }).select('_id').lean()).map(p => p._id);
            if (patternIds.length > 0) {
                const tests = await PracticeTest.find({ examPattern: { $in: patternIds } })
                    .populate('examPattern', 'title duration totalMarks sections')
                    .select('-questions.correctAnswerIndex')
                    .sort({ publishedAt: -1 })
                    .lean();
                practiceTests = tests.map(t => ({ ...t, questionCount: t.questions?.length || 0 }));
            }
        }

        return NextResponse.json({
            success: true,
            topic,
            quizzes,
            practiceTests,
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
