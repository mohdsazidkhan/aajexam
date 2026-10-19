import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Exam from '@/models/Exam';
import PracticeTest from '@/models/PracticeTest';
import UserTestAttempt from '@/models/UserTestAttempt';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import DailyChallenge from '@/models/DailyChallenge';
import DailyChallengeAttempt from '@/models/DailyChallengeAttempt';
import Reel from '@/models/Reel';
import ReelInteraction from '@/models/ReelInteraction';
import UserStreak from '@/models/UserStreak';
import Subscription from '@/models/Subscription';
import PaymentOrder from '@/models/PaymentOrder';
import WalletTransaction from '@/models/WalletTransaction';
import CommunityQuestion from '@/models/CommunityQuestion';
import CommunityAnswer from '@/models/CommunityAnswer';
import StudyPlan from '@/models/StudyPlan';
import RevisionQueue from '@/models/RevisionQueue';
import { protect, admin } from '@/middleware/auth';

export const dynamic = 'force-dynamic';

// Same bucketing / field extraction as the student's own payment history (api/subscription/payment-transactions),
// so the admin sees exactly what the user sees there.
const deriveStatus = (order) => {
    if (order.status === 'refunded') return 'refunded';
    if (order.payuStatus) {
        const s = String(order.payuStatus).toLowerCase();
        if (s === 'success') return 'success';
        if (s === 'failure' || s === 'failed') return 'failed';
        if (s === 'pending') return 'pending';
    }
    if (order.status === 'paid' || order.status === 'authorized') return 'success';
    if (order.status === 'failed') return 'failed';
    return 'pending';
};

const toTransaction = (order) => {
    const pr = order.payuResponse || {};
    const paymentMode = pr.mode || null;
    const isUpi = paymentMode === 'UPI';
    return {
        _id: order._id,
        orderId: order.orderId,
        transactionId: order.payuTransactionId || order.orderId,
        date: order.createdAt,
        description: `Payment for ${order.planId || 'plan'} subscription`,
        planId: order.planId || null,
        subscription: order.subscriptionId || null,
        amount: order.amount,
        originalAmount: order.originalAmount,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode || null,
        currency: order.currency || 'INR',
        status: deriveStatus(order),
        paymentMode,
        upiId: isUpi && pr.field3 && pr.field3.includes('@') ? pr.field3 : null,
        upiChannel: isUpi ? [pr.bankcode, pr.field8].filter(Boolean).join(' · ') || null : null,
        bankCode: !isUpi ? (pr.bankcode || null) : null,
        bankRefNum: pr.bank_ref_num || null,
        productInfo: pr.productinfo || null,
        refundAmount: order.refundAmount || 0,
        refundReason: order.refundReason || null,
    };
};

const LIST = 50; // most recent rows per section; totals come from separate counts

// GET /api/admin/user-details/:idOrUsername
// Everything AajExam knows about one user, for the admin "view user" page:
// profile + settings, subscription / payments / wallet, exam, quiz, daily challenge and reel activity,
// streak, community, study plan, revision queue and referrals.
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { id: key } = await params;
        const ref = decodeURIComponent(String(key || '')).trim();
        if (!ref) {
            return NextResponse.json({ success: false, message: 'User ID or username is required' }, { status: 400 });
        }

        await dbConnect();

        // The URL segment may be a user id (24 hex) or a username (3-20 chars, so the two never clash).
        const lookup = /^[a-f0-9]{24}$/i.test(ref) ? { _id: ref } : { username: ref.toLowerCase().replace(/^@/, '') };
        const user = await User.findOne(lookup)
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .populate({ path: 'targetExams', model: Exam, select: 'name' })
            .lean();
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        const uid = user._id;

        const [
            examAttempts, quizAttempts, dailyAttempts, reelInteractions, streak,
            subscriptions, payments, walletTxns, questions, answers, studyPlans, revision, referrals,
            examCounts, quizCounts, dailyCount, reelCounts, questionCount, answerCount, referralCount, paidTotal,
        ] = await Promise.all([
            UserTestAttempt.find({ user: uid }).sort({ createdAt: -1 }).limit(LIST)
                .populate({ path: 'practiceTest', model: PracticeTest, select: 'title totalMarks' })
                .select('practiceTest status score correctCount wrongCount accuracy totalTime rank percentile startedAt submittedAt createdAt').lean(),
            QuizAttempt.find({ user: uid }).sort({ createdAt: -1 }).limit(LIST)
                .populate({ path: 'quiz', model: Quiz, select: 'title totalMarks' })
                .select('quiz status score totalMarks correctCount wrongCount skippedCount accuracy totalTime rank percentile startedAt submittedAt createdAt').lean(),
            DailyChallengeAttempt.find({ user: uid }).sort({ submittedAt: -1 }).limit(LIST)
                .populate({ path: 'challenge', model: DailyChallenge, select: 'title date' })
                .select('challenge score correctCount wrongCount skippedCount accuracy totalTime submittedAt').lean(),
            ReelInteraction.find({ userId: uid }).sort({ viewedAt: -1 }).limit(LIST)
                .populate({ path: 'reelId', model: Reel, select: 'title type subject' })
                .select('reelId liked bookmarked shared answered isCorrect votedOptionIndex viewedAt timeSpentSeconds').lean(),
            UserStreak.findOne({ user: uid }).lean(),
            Subscription.find({ user: uid }).sort({ createdAt: -1 }).limit(20)
                .select('plan status duration startDate endDate amount discountAmount couponCode paymentMethod createdAt cancelledAt cancellationReason').lean(),
            PaymentOrder.find({ user: uid }).sort({ createdAt: -1 }).limit(LIST)
                .populate({ path: 'subscriptionId', model: Subscription, select: 'plan status' })
                .select('orderId amount originalAmount discountAmount couponCode currency status payuStatus payuTransactionId payuResponse planId paymentMethod subscriptionId refundAmount refundReason createdAt').lean(),
            WalletTransaction.find({ user: uid }).sort({ createdAt: -1 }).limit(20)
                .select('type amount balance description status processedAt createdAt').lean(),
            CommunityQuestion.find({ author: uid }).sort({ createdAt: -1 }).limit(10).select('question createdAt').lean(),
            CommunityAnswer.find({ author: uid }).sort({ createdAt: -1 }).limit(10).select('body createdAt').lean(),
            StudyPlan.find({ user: uid }).sort({ createdAt: -1 }).limit(5)
                .populate({ path: 'exam', model: Exam, select: 'name' }).select('exam examDate status createdAt').lean(),
            RevisionQueue.aggregate([{ $match: { user: uid } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
            user.referralCode
                ? User.find({ referredBy: user.referralCode }).sort({ createdAt: -1 }).limit(20)
                    .select('name email subscriptionStatus createdAt').lean()
                : [],
            UserTestAttempt.aggregate([{ $match: { user: uid } }, { $group: { _id: '$status', n: { $sum: 1 }, best: { $max: '$score' } } }]),
            QuizAttempt.aggregate([{ $match: { user: uid } }, { $group: { _id: '$status', n: { $sum: 1 }, best: { $max: '$percentage' } } }]),
            DailyChallengeAttempt.countDocuments({ user: uid }),
            ReelInteraction.aggregate([{
                $match: { userId: uid },
            }, {
                $group: {
                    _id: null,
                    viewed: { $sum: 1 },
                    liked: { $sum: { $cond: ['$liked', 1, 0] } },
                    bookmarked: { $sum: { $cond: ['$bookmarked', 1, 0] } },
                    shared: { $sum: { $cond: ['$shared', 1, 0] } },
                    answered: { $sum: { $cond: ['$answered', 1, 0] } },
                    correct: { $sum: { $cond: [{ $and: ['$answered', '$isCorrect'] }, 1, 0] } },
                    seconds: { $sum: '$timeSpentSeconds' },
                },
            }]),
            CommunityQuestion.countDocuments({ author: uid }),
            CommunityAnswer.countDocuments({ author: uid }),
            user.referralCode ? User.countDocuments({ referredBy: user.referralCode }) : 0,
            PaymentOrder.aggregate([{ $match: { user: uid, status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' }, n: { $sum: 1 } } }]),
        ]);

        const byStatus = (rows) => Object.fromEntries(rows.map((r) => [r._id || 'unknown', { count: r.n, best: r.best ?? null }]));

        // Fields that are never useful to an admin or are credentials / internals.
        const { googleId, ...profile } = user;

        return NextResponse.json({
            success: true,
            data: {
                profile: { ...profile, hasGoogle: !!googleId },
                stats: {
                    exams: byStatus(examCounts),
                    quizzes: byStatus(quizCounts),
                    dailyChallenges: dailyCount,
                    reels: reelCounts[0] || { viewed: 0, liked: 0, bookmarked: 0, shared: 0, answered: 0, correct: 0, seconds: 0 },
                    communityQuestions: questionCount,
                    communityAnswers: answerCount,
                    referrals: referralCount,
                    paid: { total: paidTotal[0]?.total || 0, orders: paidTotal[0]?.n || 0 },
                    revision: Object.fromEntries(revision.map((r) => [r._id || 'unknown', r.n])),
                },
                examAttempts,
                quizAttempts,
                dailyAttempts,
                reelInteractions,
                streak: streak ? {
                    currentStreak: streak.currentStreak,
                    longestStreak: streak.longestStreak,
                    totalActiveDays: streak.totalActiveDays,
                    lastActiveDate: streak.lastActiveDate,
                    freezesAvailable: streak.freezesAvailable,
                    freezesUsed: streak.freezesUsed,
                    history: (streak.streakHistory || []).slice(-30).reverse(),
                } : null,
                subscriptions,
                payments: payments.map(toTransaction),
                walletTxns,
                questions,
                answers,
                studyPlans,
                referrals,
                limit: LIST,
            },
        });
    } catch (error) {
        console.error('Admin user full detail error:', error);
        return NextResponse.json({ success: false, message: 'Failed to load user' }, { status: 500 });
    }
}
