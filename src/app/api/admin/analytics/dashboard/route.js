import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import PaymentOrder from '@/models/PaymentOrder';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';
import PracticeTest from '@/models/PracticeTest';
import { protect, admin } from '@/middleware/auth';

const calculateTotalRevenue = async () => {
    const revenueSummary = await PaymentOrder.aggregate([
        { $match: { payuStatus: 'success' } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' }
            }
        }
    ]);
    return revenueSummary[0]?.totalRevenue || 0;
};

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = parseInt(searchParams.get('limit') || '10');
        const fetchCount = page * limit;

        const totalUsers = await User.countDocuments({ role: 'student' });

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const activeProUsers = await User.countDocuments({
            role: 'student',
            subscriptionStatus: 'PRO',
            subscriptionExpiry: { $gte: now },
            status: 'active'
        });

        const activeUsers = await User.countDocuments({
            role: 'student',
            status: 'active',
            lastLoginDate: { $gte: thirtyDaysAgo }
        });

        const totalRevenue = await calculateTotalRevenue();

        const totalSubscriptions = await User.countDocuments({
            role: 'student',
            subscriptionStatus: 'PRO'
        });

        const totalQuizzes = await Quiz.countDocuments();

        const [quizAttemptsCount, testAttemptsCount] = await Promise.all([
            QuizAttempt.countDocuments({ status: 'Completed' }),
            UserTestAttempt.countDocuments({ status: 'Completed' })
        ]);
        const totalAttempts = quizAttemptsCount + testAttemptsCount;

        const subscriptionDistribution = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } }
        ]);

        const topUsers = await User.find({ role: 'student' })
            .select('name subscriptionStatus')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const [recentQuizAttempts, recentTestAttempts] = await Promise.all([
            QuizAttempt.find({ status: 'Completed' })
                .populate('user', 'name')
                .populate('quiz', 'title')
                .sort({ submittedAt: -1, createdAt: -1 })
                .limit(fetchCount)
                .lean(),
            UserTestAttempt.find({ status: 'Completed' })
                .populate('user', 'name')
                .populate('practiceTest', 'title')
                .sort({ submittedAt: -1, createdAt: -1 })
                .limit(fetchCount)
                .lean()
        ]);

        const mergedActivity = [
            ...recentQuizAttempts.map(a => ({
                type: 'quiz',
                user: a.user ? { name: a.user.name } : null,
                quiz: a.quiz ? { title: a.quiz.title } : null,
                score: a.score,
                scorePercentage: Math.round(a.percentage || 0),
                attemptedAt: a.submittedAt || a.createdAt
            })),
            ...recentTestAttempts.map(a => ({
                type: 'exam',
                user: a.user ? { name: a.user.name } : null,
                quiz: a.practiceTest ? { title: a.practiceTest.title } : null,
                score: a.score,
                scorePercentage: Math.round(a.accuracy || 0),
                attemptedAt: a.submittedAt || a.createdAt
            }))
        ].sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));

        const recentActivity = mergedActivity.slice((page - 1) * limit, page * limit);
        const totalActivityItems = totalAttempts;
        const totalActivityPages = Math.max(1, Math.ceil(totalActivityItems / limit));

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalNonAdminUsers: totalUsers,
                    totalRevenue,
                    totalSubscriptions,
                    totalQuizzes,
                    activeUsers,
                    totalAttempts,
                    currentMonthActiveProUsers: activeProUsers
                },
                subscriptionDistribution,
                topUsers,
                recentActivity,
                recentActivityPagination: {
                    page,
                    limit,
                    totalItems: totalActivityItems,
                    totalPages: totalActivityPages
                }
            }
        });

    } catch (error) {
        console.error('Dashboard analytics error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
