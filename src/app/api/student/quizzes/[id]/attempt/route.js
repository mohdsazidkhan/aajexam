import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import User from '@/models/User';
import QuizAttempt from '@/models/QuizAttempt';
import { v4 as uuidv4 } from 'uuid';
import { protect } from '@/middleware/auth';
import { createNotification } from '@/utils/notifications';

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const userId = auth.user.id;
        const { id: quizid } = await params;
        const body = await req.json();
        const { answers, timeSpent, startedAt, competitionType } = body;

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const quiz = await Quiz.findById(quizid);
        if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

        // Block own quiz attempts
        if (quiz.createdType === 'user' && quiz.createdBy && quiz.createdBy.toString() === userId) {
            return NextResponse.json({ message: 'You cannot attempt your own created quiz' }, { status: 403 });
        }

        const attemptStatus = await user.canAttemptQuiz(quizid, competitionType);
        if (!attemptStatus.canAttempt) {
            return NextResponse.json({
                message: attemptStatus.reason || 'Already attempted.',
                bestScore: attemptStatus.bestScore
            }, { status: 400 });
        }

        const questions = await Question.find({ quiz: quizid });
        if (!questions.length) return NextResponse.json({ message: 'No questions found' }, { status: 404 });

        let score = 0;
        let skippedQuestions = 0;
        const answerRecords = [];

        questions.forEach((q, i) => {
            const correctAnswer = q.options[q.correctAnswerIndex];
            const submittedAnswer = answers[i];

            if (submittedAnswer === 'SKIP') {
                skippedQuestions++;
                answerRecords.push({ questionId: q._id, answer: 'SKIP', isSkipped: true });
                return;
            }

            if (submittedAnswer === correctAnswer) score++;
            answerRecords.push({ questionId: q._id, answer: submittedAnswer, isSkipped: false });
        });

        const scorePercentage = Math.round((score / questions.length) * 100);
        let finalTimeSpent = timeSpent || Math.round((Date.now() - (startedAt || Date.now())) / 1000);

        const attempt = await QuizAttempt.createAttempt({
            user: userId,
            quiz: quizid,
            answers: answerRecords,
            score,
            scorePercentage,
            isBestScore: true,
            timeSpent: finalTimeSpent,
            sessionId: uuidv4(),
            competitionType: competitionType || 'none'
        });

        // Rank calculation simplified for now
        const betterCount = await QuizAttempt.countDocuments({
            quiz: quizid,
            scorePercentage: { $gt: scorePercentage }
        });
        attempt.rank = betterCount + 1;
        await attempt.save();

        user.updateQuizBestScore(quizid, score, questions.length, competitionType);
        const levelUpdate = await user.addQuizCompletion(score, questions.length, competitionType);
        const levelInfo = await user.getLevelInfo();

        await user.save();

        return NextResponse.json({
            success: true,
            total: questions.length,
            answered: questions.length - skippedQuestions,
            skipped: skippedQuestions,
            score,
            scorePercentage,
            attemptNumber: 1,
            attemptsLeft: 0,
            bestScore: scorePercentage, // Single attempt system
            isNewBestScore: true,
            isHighScore: scorePercentage >= 70,
            correctAnswers: questions.map(q => q.options[q.correctAnswerIndex]),
            answers: answerRecords,
            attemptId: attempt._id,
            subscriptionStatus: user.subscriptionStatus,
            levelUpdate: levelUpdate ? {
                levelIncreased: levelUpdate.levelIncreased,
                newLevel: levelUpdate.newLevel,
                newLevelName: levelUpdate.newLevelName,
                levelInfo: levelInfo,
                monthly: levelUpdate.monthly
            } : null,
            message: 'Quiz completed successfully!'
        });

    } catch (error) {
        console.error('Quiz attempt error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
