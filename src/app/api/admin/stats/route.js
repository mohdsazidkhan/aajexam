import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { protect, admin } from '@/middleware/auth';
import User from '@/models/User';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
import UserTestAttempt from '@/models/UserTestAttempt';
import PaymentOrder from '@/models/PaymentOrder';
import BankDetail from '@/models/BankDetail';
import WithdrawRequest from '@/models/WithdrawRequest';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import Reel from '@/models/Reel';
import StudyNote from '@/models/StudyNote';
import Blog from '@/models/Blog';
import CurrentAffair from '@/models/CurrentAffair';
import ExamNews from '@/models/ExamNews';
import DailyChallenge from '@/models/DailyChallenge';
import MentorProfile from '@/models/MentorProfile';
import Contact from '@/models/Contact';
import Notification from '@/models/Notification';
import Subscription from '@/models/Subscription';
import UserWallet from '@/models/UserWallet';
import Expense from '@/models/Expense';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            // Users
            students,
            newStudentsToday,
            newStudentsThisMonth,
            activeUsersToday,
            activeProUsers,

            // Exam content
            exams,
            activeExams,
            examCategories,
            examPatterns,
            practiceTests,
            freePracticeTests,
            pyqPracticeTests,
            testAttempts,
            completedAttempts,

            // Quiz bank
            quizzes,
            publishedQuizzes,
            questions,
            activeQuestions,
            subjects,
            topics,

            // Other content
            reels,
            publishedReels,
            studyNotes,
            blogs,
            publishedBlogs,
            currentAffairs,
            examNews,
            dailyChallenges,

            // Engagement
            mentors,
            pendingMentors,
            notifications,
            contacts,
            newContactsToday,

            // Finance
            paymentOrders,
            paymentOrdersToday,
            revenueAgg,
            revenueTodayAgg,
            revenueThisMonthAgg,
            subscriptions,
            activeSubscriptions,
            withdrawRequests,
            withdrawPaidAgg,
            bankDetails,
            walletBalanceAgg,
            expenseAgg,
        ] = await Promise.all([
            // Users
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'student', createdAt: { $gte: startOfDay } }),
            User.countDocuments({ role: 'student', createdAt: { $gte: startOfMonth } }),
            User.countDocuments({ role: 'student', lastLogin: { $gte: startOfDay } }),
            User.countDocuments({ role: 'student', subscriptionStatus: 'PRO', subscriptionExpiry: { $gte: now } }),

            // Exam content
            Exam.countDocuments(),
            Exam.countDocuments({ isActive: true }),
            ExamCategory.countDocuments(),
            ExamPattern.countDocuments(),
            PracticeTest.countDocuments(),
            PracticeTest.countDocuments({ accessLevel: 'FREE' }),
            PracticeTest.countDocuments({ isPYQ: true }),
            UserTestAttempt.countDocuments(),
            UserTestAttempt.countDocuments({ status: 'Completed' }),

            // Quiz bank
            Quiz.countDocuments(),
            Quiz.countDocuments({ status: 'published' }),
            Question.countDocuments(),
            Question.countDocuments({ isActive: true }),
            Subject.countDocuments(),
            Topic.countDocuments(),

            // Other content
            Reel.countDocuments(),
            Reel.countDocuments({ status: 'published' }),
            StudyNote.countDocuments(),
            Blog.countDocuments(),
            Blog.countDocuments({ status: 'published' }),
            CurrentAffair.countDocuments({ status: 'published' }),
            ExamNews.countDocuments({ status: 'published' }),
            DailyChallenge.countDocuments({ status: 'published' }),

            // Engagement
            MentorProfile.countDocuments(),
            MentorProfile.countDocuments({ status: 'pending' }),
            Notification.countDocuments(),
            Contact.countDocuments(),
            Contact.countDocuments({ createdAt: { $gte: startOfDay } }),

            // Finance
            PaymentOrder.countDocuments({ payuStatus: 'success' }),
            PaymentOrder.countDocuments({ payuStatus: 'success', createdAt: { $gte: startOfDay } }),
            PaymentOrder.aggregate([
                { $match: { payuStatus: 'success' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            PaymentOrder.aggregate([
                { $match: { payuStatus: 'success', createdAt: { $gte: startOfDay } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            PaymentOrder.aggregate([
                { $match: { payuStatus: 'success', createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Subscription.countDocuments(),
            Subscription.countDocuments({ status: 'active' }),
            WithdrawRequest.countDocuments({ status: 'pending' }),
            WithdrawRequest.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            BankDetail.countDocuments(),
            UserWallet.aggregate([
                { $group: { _id: null, total: { $sum: '$balance' } } },
            ]),
            Expense.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        return NextResponse.json({
            // Users
            students,
            newStudentsToday,
            newStudentsThisMonth,
            activeUsersToday,
            activeUsersCurrentMonth: activeUsersToday, // backwards compat
            activeProUsers,

            // Exam content
            exams,
            activeExams,
            examCategories,
            examPatterns,
            practiceTests,
            freePracticeTests,
            pyqPracticeTests,
            testAttempts,
            completedAttempts,

            // Quiz bank
            quizzes,
            publishedQuizzes,
            questions,
            activeQuestions,
            subjects,
            topics,

            // Other content
            reels,
            publishedReels,
            studyNotes,
            blogs,
            publishedBlogs,
            currentAffairs,
            examNews,
            dailyChallenges,

            // Engagement
            mentors,
            pendingMentors,
            notifications,
            contacts,
            newContactsToday,

            // Finance
            paymentOrders,
            paymentOrdersToday,
            totalRevenue: revenueAgg[0]?.total || 0,
            revenueToday: revenueTodayAgg[0]?.total || 0,
            revenueThisMonth: revenueThisMonthAgg[0]?.total || 0,
            subscriptions,
            activeSubscriptions,
            withdrawRequests,
            withdrawPaid: withdrawPaidAgg[0]?.total || 0,
            bankDetails,
            walletBalance: walletBalanceAgg[0]?.total || 0,
            totalExpenses: expenseAgg[0]?.total || 0,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
