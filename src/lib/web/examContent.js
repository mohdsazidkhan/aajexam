// Shared logic for the web exam-detail page. Both the legacy
// /api/real-exams/web/exams/[id]/content route and the new slug-based
// /api/real-exams/web/exams/by-slug/[slug]/content route delegate here so
// the response shape stays identical across both URLs.

import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
import Quiz from '@/models/Quiz';
import UserTestAttempt from '@/models/UserTestAttempt';
import { protect } from '@/middleware/auth';
import { markPyqAccess } from '@/lib/subscription';

export async function buildExamContent(examId, req) {
    const patternIds = (await ExamPattern.find({ exam: examId }).select('_id').lean()).map(p => p._id);

    if (!patternIds.length) {
        return {
            success: true,
            practiceTests: [],
            pyqs: [],
            quizzes: [],
            counts: { practiceTests: 0, pyqs: 0, quizzes: 0 }
        };
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
        Quiz.find({ applicableExams: examId, status: 'published' })
            .populate('subject', 'name slug')
            .populate('topic', 'name slug')
            .select('-questions')
            .sort({ publishedAt: -1 })
            .lean()
    ]);

    const [practiceTestsAccess, pyqsAccess] = await Promise.all([
        markPyqAccess(ptDocs),
        markPyqAccess(pyqDocs)
    ]);

    const auth = req ? await protect(req) : { authenticated: false };
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

    return {
        success: true,
        practiceTests,
        pyqs,
        quizzes: quizDocs,
        counts: {
            practiceTests: practiceTests.length,
            pyqs: pyqs.length,
            quizzes: quizDocs.length
        }
    };
}
