import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Quiz from '@/models/Quiz';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const subject = await Subject.findById(id).populate('exam', 'name code').lean();
        if (!subject) return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });

        // Quizzes for this subject
        const quizzes = await Quiz.find({ subject: id, status: 'published' })
            .populate('topic', 'name')
            .select('-questions')
            .sort({ publishedAt: -1 })
            .lean();

        // Practice tests from the same exam (through patterns)
        const patternIds = (await ExamPattern.find({ exam: subject.exam._id || subject.exam }).select('_id').lean()).map(p => p._id);
        const practiceTests = patternIds.length > 0
            ? await PracticeTest.find({ examPattern: { $in: patternIds } })
                .populate('examPattern', 'title duration totalMarks sections')
                .select('-questions.correctAnswerIndex')
                .sort({ publishedAt: -1 })
                .lean()
            : [];

        const testsWithCount = practiceTests.map(t => ({ ...t, questionCount: t.questions?.length || 0 }));

        return NextResponse.json({
            success: true,
            subject,
            quizzes,
            practiceTests: testsWithCount,
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
