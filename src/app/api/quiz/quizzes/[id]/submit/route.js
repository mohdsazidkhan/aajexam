import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Subject from '@/models/Subject';
import Question from '@/models/Question';
import QuizAttempt from '@/models/QuizAttempt';
import User from '@/models/User';
import QuizChallenge from '@/models/QuizChallenge';
import { protect } from '@/middleware/auth';
import { addManyWrongAnswersToRevision, snapshotFromQuestionDoc } from '@/utils/revision';
import { createNotification } from '@/utils/notifications';

// POST - submit quiz attempt
export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { id } = await params;
        const { attemptId, answers, totalTime, challengeCode } = await req.json();

        if (!attemptId) return NextResponse.json({ message: 'attemptId is required' }, { status: 400 });

        const isObjectId = mongoose.Types.ObjectId.isValid(id) && (new String(id).length === 24);
        const query = isObjectId ? { _id: id } : { slug: id };

        const quiz = await Quiz.findOne(query);
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        const attempt = await QuizAttempt.findOne({ _id: attemptId, user: auth.user._id, quiz: quiz._id, status: 'InProgress' });
        if (!attempt) return NextResponse.json({ message: 'No active attempt found' }, { status: 404 });

        // fetch full questions with correct answers
        const questions = await Question.find({ _id: { $in: quiz.questions }, isActive: true });
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        let score = 0, correctCount = 0, wrongCount = 0, skippedCount = 0;
        const evaluatedAnswers = [];
        const wrongRevisionItems = [];

        quiz.questions.forEach((qId, index) => {
            const question = questionMap.get(qId.toString());
            if (!question) return;

            const submitted = answers?.[index];
            const selectedIndex = submitted?.selectedOptionIndex ?? submitted ?? -1;
            const isSkipped = selectedIndex === -1 || selectedIndex === null || selectedIndex === undefined;

            if (isSkipped) {
                skippedCount++;
                evaluatedAnswers.push({ question: qId, selectedOptionIndex: -1, isCorrect: false, timeTaken: submitted?.timeTaken || 0 });
                return;
            }

            const correctIndex = question.options.findIndex(o => o.isCorrect);
            const isCorrect = selectedIndex === correctIndex;

            if (isCorrect) {
                correctCount++;
                score += quiz.marksPerQuestion;
            } else {
                wrongCount++;
                score -= quiz.negativeMarking;
                wrongRevisionItems.push({
                    userId: auth.user._id,
                    source: 'quiz',
                    sourceId: quiz._id,
                    sourceTitle: quiz.title || '',
                    sourceQuestionId: question._id,
                    questionRef: question._id,
                    snapshot: snapshotFromQuestionDoc(question)
                });
            }

            evaluatedAnswers.push({
                question: qId,
                selectedOptionIndex: selectedIndex,
                isCorrect,
                timeTaken: submitted?.timeTaken || 0
            });
        });

        const attempted = correctCount + wrongCount;
        const accuracy = attempted > 0 ? (correctCount / attempted) * 100 : 0;
        const percentage = quiz.totalMarks > 0 ? (Math.max(score, 0) / quiz.totalMarks) * 100 : 0;

        attempt.answers = evaluatedAnswers;
        attempt.score = score;
        attempt.totalMarks = quiz.totalMarks;
        attempt.correctCount = correctCount;
        attempt.wrongCount = wrongCount;
        attempt.skippedCount = skippedCount;
        attempt.accuracy = Math.round(accuracy * 100) / 100;
        attempt.percentage = Math.round(percentage * 100) / 100;
        // The client sums per-question `Date.now() - questionStartTime` deltas with
        // no idle cap — if a question is left open for hours (tab left idle, app
        // backgrounded) that gap gets counted as "time spent" on it, inflating
        // totalTime to absurd values. Recompute server-side instead: estimate time
        // spent from the share of questions actually answered against the quiz's
        // allotted duration, same approach used for real-exam attempts.
        const totalQuestions = quiz.questions.length;
        attempt.totalTime = totalQuestions > 0
            ? Math.round((attempted / totalQuestions) * quiz.duration * 60)
            : (totalTime || 0);
        attempt.status = 'Completed';
        attempt.submittedAt = new Date();
        await attempt.save();

        // update quiz stats
        await Quiz.findByIdAndUpdate(quiz._id, {
            $inc: { totalAttempts: 1 },
            $set: { avgScore: await getAvgScore(quiz._id) }
        });

        if (wrongRevisionItems.length) {
            addManyWrongAnswersToRevision(wrongRevisionItems).catch(() => {});
        }

        try {
            await createNotification({
                userId: auth.user._id,
                type: 'quiz_attempt',
                title: 'Quiz attempt submitted',
                description: `A user submitted a quiz attempt: "${quiz.title}"`,
                meta: { userId: auth.user._id, quizId: quiz._id, attemptId: attempt._id }
            });
        } catch (e) { console.error('Notification Error:', e); }

        // Update aggregate user performance (Readiness / Avg Score / Tests on Home)
        try {
            const user = await User.findById(auth.user._id);
            if (user) {
                const subjectDoc = quiz.subject ? await Subject.findById(quiz.subject).select('name').lean() : null;
                const subjectKey = subjectDoc?.name || 'General';
                user.updatePerformanceMetrics({ subject: subjectKey }, Math.round(percentage));
                user.markModified('performanceMetrics.examStats.subjectAccuracy');
                await user.save();
            }
        } catch (e) { console.error('updatePerformanceMetrics (quiz) failed:', e); }

        // Link to challenge if provided
        if (challengeCode) {
            try {
                await QuizChallenge.findOneAndUpdate(
                    { code: challengeCode },
                    { 
                        $push: { 
                            challengers: { user: auth.user._id, attempt: attempt._id } 
                        } 
                    }
                );
            } catch (err) {
                console.error('Failed to link challenge attempt:', err);
            }
        }

        // compute rank
        const rank = await recomputeRanksForQuiz(quiz._id, attempt._id);

        // populate answers.question for review
        const populated = await QuizAttempt.findById(attempt._id)
            .populate({
                path: 'answers.question',
                select: 'questionText options explanation difficulty image'
            })
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                ...populated,
                rank: rank.rank,
                percentile: rank.percentile
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

async function getAvgScore(quizId) {
    const result = await QuizAttempt.aggregate([
        { $match: { quiz: new mongoose.Types.ObjectId(quizId), status: 'Completed' } },
        { $group: { _id: null, avg: { $avg: '$percentage' } } }
    ]);
    return result[0]?.avg || 0;
}

// Rank of ONE attempt via two indexed counts (see recomputeRanksForTest) instead of
// re-sorting and rewriting every attempt of the quiz on each submit.
async function recomputeRanksForQuiz(quizId, targetAttemptId) {
    if (!targetAttemptId) return { rank: null, percentile: null };
    const target = await QuizAttempt.findById(targetAttemptId).select('score accuracy totalTime').lean();
    if (!target) return { rank: null, percentile: null };
    const { score = 0, accuracy = 0, totalTime = 0 } = target;
    const base = { quiz: quizId, status: 'Completed' };
    const [total, better] = await Promise.all([
        QuizAttempt.countDocuments(base),
        QuizAttempt.countDocuments({
            ...base,
            $or: [
                { score: { $gt: score } },
                { score, accuracy: { $gt: accuracy } },
                { score, accuracy, totalTime: { $lt: totalTime } },
            ],
        }),
    ]);
    if (!total) return { rank: null, percentile: null };
    const rank = better + 1;
    const percentile = total > 1 ? Number((((total - rank) / (total - 1)) * 100).toFixed(2)) : 100;
    return { rank, percentile };
}
