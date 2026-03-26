import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import User from '@/models/User';
import BankDetail from '@/models/BankDetail';
import QuizAttempt from '@/models/QuizAttempt';
import Level from '@/models/Level';
import PaymentOrder from '@/models/PaymentOrder';
import WithdrawRequest from '@/models/WithdrawRequest';
import UserQuestions from '@/models/UserQuestions';
import Article from '@/models/Article';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        const [
            categories, subcategories, quizzes, questions, students,
            bankDetails, totalQuizAttempts, totalLevels, activeLevels,
            inactiveLevels, totalSubscriptions, activeSubscriptions,
            freeSubscriptions, paidSubscriptions, totalPaymentOrders,
            completedPaymentOrders, withdrawRequests, pendingWithdrawRequests,
            userQuestions, pendingUserQuestions, approvedUserQuestions,
            rejectedUserQuestions, userQuizzes, approvedUserQuizzes,
            pendingUserQuizzes, rejectedUserQuizzes
        ] = await Promise.all([
            Category.countDocuments(),
            Subcategory.countDocuments(),
            Quiz.countDocuments(),
            Question.countDocuments(),
            User.countDocuments({ role: 'student' }),
            BankDetail.countDocuments(),
            QuizAttempt.countDocuments(),
            Level.countDocuments(),
            Level.countDocuments({ isActive: true }),
            Level.countDocuments({ isActive: false }),
            User.countDocuments({}),
            User.countDocuments({ subscriptionExpiry: { $exists: true, $ne: null, $gt: new Date() } }),
            User.countDocuments({ subscriptionStatus: 'free' }),
            User.countDocuments({ subscriptionStatus: { $nin: ['free'] } }),
            PaymentOrder.countDocuments(),
            PaymentOrder.countDocuments({ payuStatus: 'success' }),
            WithdrawRequest.countDocuments(),
            WithdrawRequest.countDocuments({ status: 'pending' }),
            UserQuestions.countDocuments(),
            UserQuestions.countDocuments({ status: 'pending' }),
            UserQuestions.countDocuments({ status: 'approved' }),
            UserQuestions.countDocuments({ status: 'rejected' }),
            Quiz.countDocuments({ createdType: 'user' }),
            Quiz.countDocuments({ createdType: 'user', status: 'approved' }),
            Quiz.countDocuments({ createdType: 'user', status: 'pending' }),
            Quiz.countDocuments({ createdType: 'user', status: 'rejected' })
        ]);

        const revenueSummary = await PaymentOrder.aggregate([
            { $match: { payuStatus: 'success' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueSummary[0]?.totalRevenue || 0;

        const userBlogsResult = await Article.aggregate([
            { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorInfo' } },
            { $unwind: '$authorInfo' },
            { $match: { 'authorInfo.role': 'student' } },
            { $count: 'total' }
        ]);
        const userBlogs = userBlogsResult[0]?.total || 0;

        return NextResponse.json({
            categories, subcategories, quizzes, questions, students,
            bankDetails, totalQuizAttempts, subscriptions: totalSubscriptions,
            activeSubscriptions, freeSubscriptions, paidSubscriptions,
            paymentOrders: totalPaymentOrders, completedPaymentOrders,
            totalRevenue, withdrawRequests, pendingWithdrawRequests,
            userQuestions, pendingUserQuestions, approvedUserQuestions,
            rejectedUserQuestions, userQuizzes, approvedUserQuizzes,
            pendingUserQuizzes, rejectedUserQuizzes, totalLevels,
            activeLevels, inactiveLevels, userBlogs
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }
}
