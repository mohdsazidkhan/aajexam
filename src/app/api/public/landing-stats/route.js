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
import ExamPattern from '@/models/ExamPattern';

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

        // Fetch stats for specific requested exams
        const targetRegexes = [
            /^SSC CGL/i,
            /^SSC CHSL/i,
            /^RRB GROUP D/i,
            /^SSC CPO/i,
            /^UPSC Prelims/i,
            /^SSC GD/i
        ];
        let topExams = await Exam.find({ 
            isActive: true,
            name: { $in: targetRegexes }
        }).lean();
        
        // Sort them to match the user's requested order
        topExams.sort((a, b) => {
             const getIndex = (name) => {
                 const idx = targetRegexes.findIndex(r => r.test(name));
                 return idx === -1 ? 99 : idx;
             };
             return getIndex(a.name) - getIndex(b.name);
        });
        
        // Ensure we only process at most 6 exams in case of multiple regex matches
        topExams = topExams.slice(0, 6);
        
        const examStats = await Promise.all(topExams.map(async (exam) => {
            const patterns = await ExamPattern.find({ exam: exam._id }, '_id').lean();
            const patternIds = patterns.map(p => p._id);
            
            const pyqCount = await PracticeTest.countDocuments({ examPattern: { $in: patternIds }, isPYQ: true });
            const practiceTestCount = await PracticeTest.countDocuments({ examPattern: { $in: patternIds }, isPYQ: false });
            const quizCount = await Quiz.countDocuments({ applicableExams: exam._id, status: 'published' });
            
            return {
                _id: exam._id.toString(),
                name: exam.name,
                code: exam.code,
                pyqCount,
                practiceTestCount,
                quizCount
            };
        }));

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
                examStats,
            }
        });

        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return response;

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
