import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Exam from '@/models/Exam';
import Quiz from '@/models/Quiz';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import Question from '@/models/Question';
import PracticeTest from '@/models/PracticeTest';

export async function GET() {
    try {
        await dbConnect();
        const [activeStudents, totalExams, totalQuizzes, totalSubjects, totalTopics, quizQuestions, practiceTestQuestions] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            Exam.countDocuments({ isActive: true }),
            Quiz.countDocuments(),
            Subject.countDocuments({ isActive: true }),
            Topic.countDocuments({ isActive: true }),
            Question.countDocuments(),
            PracticeTest.aggregate([
                { $project: { count: { $size: '$questions' } } },
                { $group: { _id: null, total: { $sum: '$count' } } }
            ]).then(res => res[0]?.total || 0)
        ]);

        return NextResponse.json({
            success: true,
            data: {
                activeStudents,
                totalExams,
                totalQuizzes,
                totalSubjects,
                totalTopics,
                totalQuestions: quizQuestions + practiceTestQuestions
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
