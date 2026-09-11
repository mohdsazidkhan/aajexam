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
import { sendBrevoEmail } from '@/utils/email';

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { id: testId } = await params;
        const { answers, attemptId } = await req.json();
        const auth = await protect(req);

        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const attemptQuery = {
            user: auth.user.id,
            practiceTest: testId,
            status: 'InProgress'
        };

        if (attemptId) {
            attemptQuery._id = attemptId;
        }

        // test is read-only here (never saved) so it's safe to lean; the attempt
        // gets mutated + saved below so it must stay a hydrated document. Neither
        // fetch depends on the other, so run them concurrently.
        const [test, attempt] = await Promise.all([
            PracticeTest.findById(testId).populate('examPattern', 'sections negativeMarking title exam').lean(),
            UserTestAttempt.findOne(attemptQuery)
        ]);
        if (!test) return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });
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
        // Lightweight targeted update instead of a full attempt.save() — same
        // two fields persisted, without re-validating the whole document again.
        await UserTestAttempt.updateOne({ _id: attempt._id }, { $set: { rank, percentile } });

        // None of these side effects (aggregate performance metrics, result email,
        // notification) appear in the response below, so don't block on them —
        // run them after the response is prepared, fire-and-forget, same as their
        // existing non-fatal try/catch handling already implied.
        (async () => {
            let user;
            try {
                user = await User.findById(auth.user.id);
                if (user) {
                    const totalMarks = test.totalMarks || 0;
                    const scorePct = totalMarks > 0 ? (Math.max(evaluation.totalScore, 0) / totalMarks) * 100 : 0;
                    const subjectKey = String(test.examPattern?.exam || test.examPattern?._id || 'Mock');
                    user.updatePerformanceMetrics({ subject: subjectKey }, Math.round(scorePct));
                    user.markModified('performanceMetrics.examStats.subjectAccuracy');
                    await user.save();
                }
            } catch (e) { console.error('updatePerformanceMetrics (test) failed:', e); }

            // Send Result Email (reuses the same user fetched above instead of
            // querying it again — name/email are unaffected by the metrics update)
            try {
                if (user && user.email) {
                    const totalMins = Math.floor(attempt.totalTime / 60000);
                    const totalSecs = Math.floor((attempt.totalTime % 60000) / 1000);
                    const timeString = `${totalMins}m ${totalSecs}s`;
                    const examName = test.examPattern?.exam?.name || 'General';

                    const resultHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <h2 style="color: #4F46E5;">Your Test Results are here! 📊</h2>
                        <p>Hi ${user.name}, you just completed a test. Here's a quick summary of your performance:</p>

                        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #1E293B;">${test.title}</h3>
                            <p style="margin: 5px 0;"><strong>Exam:</strong> ${examName}</p>
                            <p style="margin: 5px 0;"><strong>Time Taken:</strong> ${timeString}</p>
                            <p style="margin: 5px 0; font-size: 1.1em;"><strong>Score:</strong> <span style="color: #059669; font-weight: bold;">${evaluation.totalScore}</span> / ${test.totalMarks || (test.questions.length)}</p>
                            <p style="margin: 5px 0;"><strong>Current Rank:</strong> #${attempt.rank || 'N/A'}</p>
                        </div>

                        <p>Log in to AajExam to view your detailed analytics and topper comparison.</p>
                        <a href="https://aajexam.com/dashboard" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Detailed Analysis</a>

                        <p style="margin-top: 30px; font-size: 0.9em; color: #64748B;">Keep practicing,<br><strong>The AajExam Team</strong></p>
                    </div>
                    `;
                    sendBrevoEmail({
                        to: user.email,
                        subject: `Result: ${test.title} - You scored ${evaluation.totalScore}!`,
                        html: resultHtml
                    }).catch(err => console.error('Failed to send result email:', err));
                }
            } catch (emailErr) {
                console.error('Email send failed:', emailErr);
            }

            try {
                await createNotification({
                    userId: auth.user.id,
                    type: 'exam_attempt',
                    title: 'New govt exam test submitted',
                    description: `A user submitted a govt exam test: "${test.title}"`,
                    meta: { userId: auth.user.id, testId, attemptId: attempt._id, examId: test.examPattern?.exam }
                });
            } catch (e) { console.error('Notification Error:', e); }
        })();

        const responseQuestions = test.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            questionImage: q.questionImage || '',
            options: q.options,
            optionImages: q.optionImages || [],
            correctAnswerIndex: q.correctAnswerIndex,
            explanation: q.explanation,
            explanationImage: q.explanationImage || '',
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
