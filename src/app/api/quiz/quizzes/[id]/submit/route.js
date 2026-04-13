import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import QuizAttempt from '@/models/QuizAttempt';
import { protect } from '@/middleware/auth';

// POST - submit quiz attempt
export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { id } = await params;
        const { attemptId, answers, totalTime } = await req.json();

        if (!attemptId) return NextResponse.json({ message: 'attemptId is required' }, { status: 400 });

        const attempt = await QuizAttempt.findOne({ _id: attemptId, user: auth.user._id, quiz: id, status: 'InProgress' });
        if (!attempt) return NextResponse.json({ message: 'No active attempt found' }, { status: 404 });

        const quiz = await Quiz.findById(id);
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        // fetch full questions with correct answers
        const questions = await Question.find({ _id: { $in: quiz.questions }, isActive: true });
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        let score = 0, correctCount = 0, wrongCount = 0, skippedCount = 0;
        const evaluatedAnswers = [];

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
        attempt.totalTime = totalTime || 0;
        attempt.status = 'Completed';
        attempt.submittedAt = new Date();
        await attempt.save();

        // update quiz stats
        await Quiz.findByIdAndUpdate(id, {
            $inc: { totalAttempts: 1 },
            $set: { avgScore: await getAvgScore(id) }
        });

        // compute rank
        const rank = await recomputeRanksForQuiz(id, attempt._id);

        return NextResponse.json({
            success: true,
            data: {
                ...attempt.toObject(),
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
        { $match: { quiz: quizId, status: 'Completed' } },
        { $group: { _id: null, avg: { $avg: '$percentage' } } }
    ]);
    return result[0]?.avg || 0;
}

async function recomputeRanksForQuiz(quizId, targetAttemptId) {
    const attempts = await QuizAttempt.find({ quiz: quizId, status: 'Completed' })
        .select('_id score accuracy totalTime')
        .sort({ score: -1, accuracy: -1, totalTime: 1 });

    const total = attempts.length;
    if (!total) return { rank: null, percentile: null };

    const bulkOps = [];
    let prevMetrics = null, prevRank = null, targetRank = { rank: null, percentile: null };

    attempts.forEach((a, i) => {
        let currentRank = i + 1;
        if (prevMetrics && prevMetrics.score === a.score && prevMetrics.accuracy === a.accuracy && prevMetrics.totalTime === a.totalTime) {
            currentRank = prevRank;
        }
        const percentile = total > 1 ? Number((((total - currentRank) / (total - 1)) * 100).toFixed(2)) : 100;

        bulkOps.push({ updateOne: { filter: { _id: a._id }, update: { $set: { rank: currentRank, percentile } } } });

        if (targetAttemptId && a._id.toString() === targetAttemptId.toString()) {
            targetRank = { rank: currentRank, percentile };
        }
        prevMetrics = { score: a.score, accuracy: a.accuracy, totalTime: a.totalTime };
        prevRank = currentRank;
    });

    if (bulkOps.length) await QuizAttempt.bulkWrite(bulkOps);
    return targetRank;
}
