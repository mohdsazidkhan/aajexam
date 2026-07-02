import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Exam from '@/models/Exam';
import Quiz from '@/models/Quiz';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import Question from '@/models/Question';
import PracticeTest from '@/models/PracticeTest';
import UserTestAttempt from '@/models/UserTestAttempt';
import QuizAttempt from '@/models/QuizAttempt';

export async function GET() {
    try {
        await dbConnect();

        const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            activeStudents,
            totalExams,
            totalQuizzes,
            totalSubjects,
            totalTopics,
            quizQuestions,
            practiceTestQuestions,
            recentRegistrations,
            recentTestAttempts,
            recentQuizAttempts,
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            Exam.countDocuments({ isActive: true }),
            Quiz.countDocuments(),
            Subject.countDocuments({ isActive: true }),
            Topic.countDocuments({ isActive: true }),
            Question.countDocuments(),
            PracticeTest.aggregate([
                { $project: { count: { $size: '$questions' } } },
                { $group: { _id: null, total: { $sum: '$count' } } }
            ]).then(res => res[0]?.total || 0),
            User.countDocuments({ role: 'student', createdAt: { $gte: since7d } }),
            UserTestAttempt.countDocuments({ createdAt: { $gte: since7d } }),
            QuizAttempt.countDocuments({ createdAt: { $gte: since7d } }),
        ]);

        const response = NextResponse.json({
            success: true,
            data: {
                activeStudents,
                totalExams,
                totalQuizzes,
                totalSubjects,
                totalTopics,
                totalQuestions: quizQuestions + practiceTestQuestions,
                recentRegistrations,
                recentAttempts: recentTestAttempts + recentQuizAttempts,
            }
        });

        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return response;

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
