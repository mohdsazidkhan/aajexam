import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
import Quiz from '@/models/Quiz';
import UserTestAttempt from '@/models/UserTestAttempt';
import { protect } from '@/middleware/auth';
import { markPyqAccess } from '@/lib/subscription';

// Web-only endpoint: returns practice tests, PYQs and quizzes split for the
// AajExam web exam-detail page. Mobile app continues using the legacy
// /api/real-exams/exams/[id]/practice-tests route untouched.
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const patternIds = (await ExamPattern.find({ exam: id }).select('_id').lean()).map(p => p._id);

        if (!patternIds.length) {
            return NextResponse.json({
                success: true,
                practiceTests: [],
                pyqs: [],
                quizzes: [],
                counts: { practiceTests: 0, pyqs: 0, quizzes: 0 }
            });
        }

        const [ptDocs, pyqDocs, quizDocs] = await Promise.all([
            PracticeTest.find({ examPattern: { $in: patternIds }, isPYQ: { $ne: true } })
                .populate({ path: 'examPattern', select: 'title duration totalMarks sections negativeMarking' })
                .select('-questions.correctAnswerIndex')
                .sort({ publishedAt: -1 })
                .lean(),
            PracticeTest.find({ examPattern: { $in: patternIds }, isPYQ: true })
                .populate({ path: 'examPattern', select: 'title duration totalMarks sections negativeMarking' })
                .select('-questions.correctAnswerIndex')
                .sort({ pyqYear: -1, publishedAt: -1 })
                .lean(),
            Quiz.find({ applicableExams: id, status: 'published' })
                .populate('subject', 'name')
                .populate('topic', 'name')
                .select('-questions')
                .sort({ publishedAt: -1 })
                .lean()
        ]);

        const [practiceTestsAccess, pyqsAccess] = await Promise.all([
            markPyqAccess(ptDocs),
            markPyqAccess(pyqDocs)
        ]);

        const auth = await protect(req);
        let attemptMap = {};
        if (auth.authenticated) {
            const allTestIds = [...practiceTestsAccess, ...pyqsAccess].map(t => t._id);
            if (allTestIds.length) {
                const attempts = await UserTestAttempt.find({
                    user: auth.user._id,
                    practiceTest: { $in: allTestIds },
                    status: { $in: ['Completed', 'InProgress'] }
                }).select('practiceTest status score correctCount wrongCount accuracy rank percentile').lean();
                attemptMap = Object.fromEntries(attempts.map(a => [a.practiceTest.toString(), a]));
            }
        }

        const decorate = (t) => ({
            ...t,
            questionCount: t.questions?.length || 0,
            userAttempt: attemptMap[t._id.toString()] || null
        });

        const practiceTests = practiceTestsAccess.map(decorate);
        const pyqs = pyqsAccess.map(decorate);

        return NextResponse.json({
            success: true,
            practiceTests,
            pyqs,
            quizzes: quizDocs,
            counts: {
                practiceTests: practiceTests.length,
                pyqs: pyqs.length,
                quizzes: quizDocs.length
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
