import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';
import Quiz from '@/models/Quiz';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

// GET - Calculate exam readiness score
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();
        const { examId } = await params;
        const userId = auth.user._id;

        // PRO CHECK: Readiness Score is a PRO feature
        if (auth.user.subscriptionStatus !== 'pro' && auth.user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Readiness Score is a PRO feature. Upgrade to unlock deep insights!',
                isLocked: true
            }, { status: 403 });
        }

        // Get quiz attempts for this exam (curated via applicableExams)
        const quizzes = await Quiz.find({ applicableExams: examId }).select('_id subject');
        const quizIds = quizzes.map(q => q._id);

        const quizAttempts = await QuizAttempt.find({
            user: userId,
            quiz: { $in: quizIds },
            status: 'Completed'
        }).populate('quiz', 'subject totalMarks');

        // Get practice test attempts for this exam
        const patterns = await ExamPattern.find({ exam: examId }).select('_id');
        const patternIds = patterns.map(p => p._id);
        const practiceTests = await PracticeTest.find({ examPattern: { $in: patternIds } }).select('_id');
        const testIds = practiceTests.map(t => t._id);

        const testAttempts = await UserTestAttempt.find({
            user: userId,
            practiceTest: { $in: testIds },
            status: 'Completed'
        });

        // Calculate subject-wise accuracy
        const subjectStats = {};
        for (const attempt of quizAttempts) {
            const subject = attempt.quiz?.subject?.toString() || 'General';
            if (!subjectStats[subject]) {
                subjectStats[subject] = { totalScore: 0, totalMarks: 0, attempts: 0 };
            }
            subjectStats[subject].totalScore += attempt.score;
            subjectStats[subject].totalMarks += attempt.totalMarks;
            subjectStats[subject].attempts += 1;
        }

        const subjectAccuracy = {};
        for (const [subject, stats] of Object.entries(subjectStats)) {
            subjectAccuracy[subject] = stats.totalMarks > 0
                ? Math.round((stats.totalScore / stats.totalMarks) * 100)
                : 0;
        }

        // Overall readiness calculation
        const totalQuizAttempts = quizAttempts.length;
        const totalTestAttempts = testAttempts.length;
        const totalAttempts = totalQuizAttempts + totalTestAttempts;

        let avgQuizScore = 0;
        if (quizAttempts.length > 0) {
            avgQuizScore = quizAttempts.reduce((sum, a) => sum + a.accuracy, 0) / quizAttempts.length;
        }

        let avgTestScore = 0;
        if (testAttempts.length > 0) {
            avgTestScore = testAttempts.reduce((sum, a) => sum + a.accuracy, 0) / testAttempts.length;
        }

        // Weighted readiness: 40% quiz performance + 40% test performance + 20% consistency
        const consistencyScore = Math.min(100, totalAttempts * 5); // 5 points per attempt, max 100
        const readiness = Math.round(
            (avgQuizScore * 0.4) + (avgTestScore * 0.4) + (consistencyScore * 0.2)
        );

        // Trend (last 5 vs previous 5)
        const recentAttempts = quizAttempts.slice(-5);
        const olderAttempts = quizAttempts.slice(-10, -5);
        const recentAvg = recentAttempts.length > 0 ? recentAttempts.reduce((s, a) => s + a.accuracy, 0) / recentAttempts.length : 0;
        const olderAvg = olderAttempts.length > 0 ? olderAttempts.reduce((s, a) => s + a.accuracy, 0) / olderAttempts.length : 0;
        const trend = recentAvg - olderAvg;

        // Weak subjects (below 50%)
        const weakSubjects = Object.entries(subjectAccuracy)
            .filter(([, acc]) => acc < 50)
            .map(([subject, accuracy]) => ({ subject, accuracy }));

        // Strong subjects (above 70%)
        const strongSubjects = Object.entries(subjectAccuracy)
            .filter(([, acc]) => acc >= 70)
            .map(([subject, accuracy]) => ({ subject, accuracy }));

        return NextResponse.json({
            success: true,
            data: {
                readiness: Math.min(100, readiness),
                subjectAccuracy,
                totalAttempts,
                totalQuizAttempts,
                totalTestAttempts,
                avgQuizScore: Math.round(avgQuizScore),
                avgTestScore: Math.round(avgTestScore),
                trend: Math.round(trend),
                weakSubjects,
                strongSubjects,
                recommendation: readiness < 40
                    ? 'Focus on weak subjects and attempt more practice tests'
                    : readiness < 70
                        ? 'Good progress! Take full mock tests to improve'
                        : 'Excellent! Focus on revision and time management'
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
