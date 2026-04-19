import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import UserTestAttempt from '@/models/UserTestAttempt';
import User from '@/models/User';
import { protect } from '@/middleware/auth';
import { normalizeSubmittedAnswers, evaluateAnswers, recomputeRanksForTest } from '../../../helpers';
import { createNotification } from '@/utils/notifications';
import { addManyWrongAnswersToRevision, snapshotFromPracticeTestQuestion } from '@/utils/revision';

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { id: testId } = await params;
        const { answers, attemptId } = await req.json();
        const auth = await protect(req);

        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const test = await PracticeTest.findById(testId).populate('examPattern', 'sections negativeMarking title exam');
        if (!test) return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });

        const attemptQuery = {
            user: auth.user.id,
            practiceTest: testId,
            status: 'InProgress'
        };

        if (attemptId) {
            attemptQuery._id = attemptId;
        }

        const attempt = await UserTestAttempt.findOne(attemptQuery);
        if (!attempt) return NextResponse.json({ success: false, message: 'No active attempt found' }, { status: 400 });

        const normalizedAnswers = normalizeSubmittedAnswers(test, answers);
        const evaluation = evaluateAnswers(test.questions, normalizedAnswers, test.examPattern.sections);

        attempt.answers = evaluation.answerDetails;
        attempt.score = evaluation.totalScore;
        attempt.correctCount = evaluation.correctCount;
        attempt.wrongCount = evaluation.wrongCount;
        attempt.accuracy = evaluation.accuracy;
        attempt.totalTime = Date.now() - attempt.startedAt.getTime();
        attempt.submittedAt = new Date();
        attempt.status = 'Completed';
        await attempt.save();

        const wrongRevisionItems = evaluation.answerDetails
            .map((ans, i) => ({ ans, q: test.questions[i] }))
            .filter(({ ans, q }) => q && !ans.isCorrect && ans.selectedIndex !== -1)
            .map(({ q }) => ({
                userId: auth.user.id,
                source: 'practice_test',
                sourceId: testId,
                sourceTitle: test.title || '',
                sourceQuestionId: q._id,
                snapshot: snapshotFromPracticeTestQuestion(q)
            }));
        if (wrongRevisionItems.length) {
            addManyWrongAnswersToRevision(wrongRevisionItems).catch(() => {});
        }

        const { rank, percentile } = await recomputeRanksForTest(testId, attempt._id);
        attempt.rank = rank;
        attempt.percentile = percentile;
        await attempt.save();

        // Update aggregate user performance (Readiness / Avg Score / Tests on Home)
        try {
            const user = await User.findById(auth.user.id);
            if (user) {
                const totalMarks = test.totalMarks || 0;
                const scorePct = totalMarks > 0 ? (Math.max(evaluation.totalScore, 0) / totalMarks) * 100 : 0;
                const subjectKey = String(test.examPattern?.exam || test.examPattern?._id || 'Mock');
                user.updatePerformanceMetrics({ subject: subjectKey }, Math.round(scorePct));
                user.markModified('performanceMetrics.examStats.subjectAccuracy');
                await user.save();
            }
        } catch (e) { console.error('updatePerformanceMetrics (test) failed:', e); }

        try {
            await createNotification({
                userId: auth.user.id,
                type: 'exam_attempt',
                title: 'New govt exam test submitted',
                description: `A user submitted a govt exam test: "${test.title}"`,
                meta: { userId: auth.user.id, testId, attemptId: attempt._id, examId: test.examPattern?.exam }
            });
        } catch (e) { console.error('Notification Error:', e); }

        const responseQuestions = test.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            questionImage: q.questionImage || '',
            options: q.options,
            optionImages: q.optionImages || [],
            correctAnswerIndex: q.correctAnswerIndex,
            explanation: q.explanation,
            section: q.section
        }));

        return NextResponse.json({
            success: true,
            message: 'Test submitted successfully',
            data: {
                attemptId: attempt._id,
                score: evaluation.totalScore,
                correctCount: evaluation.correctCount,
                wrongCount: evaluation.wrongCount,
                accuracy: evaluation.accuracy,
                totalTime: attempt.totalTime,
                rank: attempt.rank,
                percentile: attempt.percentile,
                questions: responseQuestions,
                sectionWiseScore: evaluation.sectionWiseScore
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
