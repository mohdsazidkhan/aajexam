import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import config from '@/lib/config/appConfig';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Question from '@/models/Question';
import Exam from '@/models/ExamCategory';

export async function GET() {
    try {
        await dbConnect();
        const [totalUsers, totalQuizzes, totalQuizAttempts, totalCategories, totalSubcategories, totalQuestions, paidSubscriptions, totalExams] = await Promise.all([
            User.countDocuments({ role: 'student' }), Quiz.countDocuments({ isActive: true }), QuizAttempt.countDocuments(),
            Category.countDocuments(), Subcategory.countDocuments(), Question.countDocuments(),
            User.countDocuments({ role: 'student', subscriptionStatus: { $nin: ['free'] } }),
            Exam.countDocuments()
        ]);

        const PRIZE_PER_PRO = config.QUIZ_CONFIG.PRIZE_PER_PRO;
        const today = new Date();
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const activeProUsers = await User.countDocuments({
            subscriptionStatus: 'pro', status: 'active', subscriptionExpiry: { $gte: today },
            $or: [{ 'monthlyProgress.month': monthStr }, { subscriptionExpiry: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) } }]
        });

        const calculatedPool = activeProUsers * PRIZE_PER_PRO;
        const minPool = config.QUIZ_CONFIG.MIN_MONTHLY_POOL || 0;
        const monthlyPrizePool = Math.max(calculatedPool, minPool);

        return NextResponse.json({
            success: true,
            data: {
                activeStudents: totalUsers, quizCategories: totalCategories, subcategories: totalSubcategories, totalQuizzes, totalQuestions,
                quizzesTaken: totalQuizAttempts, totalExams, paidSubscriptions, monthlyPrizePool, activeProUsers, prizePerUser: PRIZE_PER_PRO
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
