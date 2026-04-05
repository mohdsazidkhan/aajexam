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
            categories, subcategories, questions, bankDetails, totalQuizAttempts, 
            totalPaymentOrders, completedPaymentOrders, 
            withdrawRequests, pendingWithdrawRequests,
            userStats, levelStats, userQuestionStats, quizStats
        ] = await Promise.all([
            Category.countDocuments(),
            Subcategory.countDocuments(),
            Question.countDocuments(),
            BankDetail.countDocuments(),
            QuizAttempt.countDocuments(),
            PaymentOrder.countDocuments(),
            PaymentOrder.countDocuments({ payuStatus: 'success' }),
            WithdrawRequest.countDocuments(),
            WithdrawRequest.countDocuments({ status: 'pending' }),
            
            // Grouped User Stats
            User.aggregate([
                {
                    $group: {
                        _id: null,
                        students: { $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] } },
                        total: { $sum: 1 },
                        activeSubs: { $sum: { $cond: [{ $and: [{ $ne: ["$subscriptionExpiry", null] }, { $gt: ["$subscriptionExpiry", new Date()] }] }, 1, 0] } },
                        freeSubs: { $sum: { $cond: [{ $eq: ["$subscriptionStatus", "free"] }, 1, 0] } },
                        paidSubs: { $sum: { $cond: [{ $ne: ["$subscriptionStatus", "free"] }, 1, 0] } }
                    }
                }
            ]),

            // Grouped Level Stats
            Level.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: { $sum: { $cond: ["$isActive", 1, 0] } },
                        inactive: { $sum: { $cond: ["$isActive", 0, 1] } }
                    }
                }
            ]),

            // Grouped UserQuestion Stats
            UserQuestions.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }
                    }
                }
            ]),

            // Grouped Quiz Stats (including User-created)
            Quiz.aggregate([
                {
                    $facet: {
                        total: [{ $count: "count" }],
                        userCreated: [
                            { $match: { createdType: 'user' } },
                            {
                                $group: {
                                    _id: null,
                                    total: { $sum: 1 },
                                    approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                                    pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                                    rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }
                                }
                            }
                        ]
                    }
                }
            ])
        ]);

        const u = userStats[0] || { students: 0, total: 0, activeSubs: 0, freeSubs: 0, paidSubs: 0 };
        const l = levelStats[0] || { total: 0, active: 0, inactive: 0 };
        const uq = userQuestionStats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };
        const qTotal = quizStats[0]?.total[0]?.count || 0;
        const qUser = quizStats[0]?.userCreated[0] || { total: 0, approved: 0, pending: 0, rejected: 0 };

        const students = u.students;
        const totalSubscriptions = u.total;
        const activeSubscriptions = u.activeSubs;
        const freeSubscriptions = u.freeSubs;
        const paidSubscriptions = u.paidSubs;
        
        const totalLevels = l.total;
        const activeLevels = l.active;
        const inactiveLevels = l.inactive;

        const userQuestions = uq.total;
        const pendingUserQuestions = uq.pending;
        const approvedUserQuestions = uq.approved;
        const rejectedUserQuestions = uq.rejected;

        const quizzes = qTotal;
        const userQuizzes = qUser.total;
        const approvedUserQuizzes = qUser.approved;
        const pendingUserQuizzes = qUser.pending;
        const rejectedUserQuizzes = qUser.rejected;

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
