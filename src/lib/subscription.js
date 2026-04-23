import mongoose from 'mongoose';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import WalletTransaction from '@/models/WalletTransaction';
import { applyReferralRewards } from '@/utils/rewards';
import { createNotification } from '@/utils/notifications';

/**
 * Activates a subscription for a user after successful payment.
 * Shared between webhooks and manual verification routes.
 */
export async function activateSubscription({ userId, planId, amount, txnid, paymentOrder }) {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const normalizedPlan = (planId || '').toUpperCase();

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found during activation");

    let subscription = await Subscription.findOne({ user: userId });
    if (subscription) {
        subscription.plan = normalizedPlan;
        subscription.billingCycle = 'monthly';
        subscription.status = 'active';
        subscription.startDate = startDate;
        subscription.endDate = endDate;
        subscription.amount = amount;
        await subscription.save();
    } else {
        subscription = new Subscription({
            user: userId,
            plan: normalizedPlan,
            billingCycle: 'monthly',
            status: 'active',
            startDate,
            endDate,
            amount: amount
        });
        await subscription.save();
    }

    // Update payment order with subscription ID
    if (paymentOrder) {
        paymentOrder.subscriptionId = subscription._id;
        await paymentOrder.save();
    }

    // Update user status
    user.currentSubscription = subscription._id;
    user.subscriptionStatus = normalizedPlan;
    user.subscriptionExpiry = endDate;
    await user.save();

    // Apply rewards
    await applyReferralRewards(user, normalizedPlan, amount);

    // Record wallet transaction for tracking
    await WalletTransaction.create({
        user: userId,
        type: 'debit',
        amount: amount,
        balance: user.walletBalance || 0,
        description: `Payment for ${normalizedPlan} subscription via PayU`,
        category: 'subscription_payment',
        status: 'completed',
        reference: txnid,
        subscriptionId: subscription._id,
        metadata: { gateway: 'payu', payuTransactionId: txnid }
    });

    // Create notification
    await createNotification({
        userId,
        type: 'subscription',
        title: 'New subscription purchase',
        description: `${normalizedPlan} (monthly) - ₹${amount}`,
        meta: { subscriptionId: subscription._id, plan: normalizedPlan }
    });

    return subscription;
}

/**
 * Checks if a user has access to a specific piece of content based on their plan.
 * @param {Object} user - User object from DB
 * @param {String} requiredLevel - 'FREE' or 'PRO'
 * @param {String} itemType - 'quiz', 'mock', 'pyq', etc.
 * @returns {Boolean}
 */
export function hasAccess(user, requiredLevel, itemType = '') {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const currentStatus = (user.subscriptionStatus || 'FREE').toUpperCase();
    const targetLevel = (requiredLevel || 'PRO').toUpperCase();

    // PRO users have access to everything
    if (currentStatus === 'PRO') {
        const now = new Date();
        const expiryDate = new Date(user.subscriptionExpiry);
        if (expiryDate > now) return true;
    }

    // FREE users: check if the content is marked as free
    if (targetLevel === 'FREE') return true;

    // Special Case: First Full Mock is Free
    if (itemType === 'full_mock' && user.fullMockAttemptCount === 0) {
        return true;
    }

    return false;
}

/**
 * Checks if a free user can attempt another subject test today.
 * Limit: 2 tests per day for free users.
 */
export async function canAttemptSubjectTest(user) {
    if (!user) return false;
    const currentStatus = (user.subscriptionStatus || 'FREE').toUpperCase();
    if (user.role === 'admin' || currentStatus === 'PRO') return true;

    const now = new Date();
    const lastReset = new Date(user.lastTestResetDate || 0);

    // Check if it's a new day
    const isNewDay = now.toDateString() !== lastReset.toDateString();

    if (isNewDay) {
        user.dailySubjectTestCount = 0;
        user.lastTestResetDate = now;
        // Note: we don't save yet, caller should handle it or we do it here
        await user.save();
        return true;
    }

    return user.dailySubjectTestCount < 2;
}

/**
 * Checks if a free user can attempt a Full Mock.
 * Limit: 1 free attempt in lifetime.
 */
export function canAttemptFullMock(user) {
    if (!user) return false;
    const currentStatus = (user.subscriptionStatus || 'FREE').toUpperCase();
    if (user.role === 'admin' || currentStatus === 'PRO') return true;

    return (user.fullMockAttemptCount || 0) < 1;
}

/**
 * Utility to mark PYQ access levels in a list of tests.
 * Last Year PYQ is FREE, others are PRO.
 * @param {Array} tests - List of PracticeTest objects
 * @returns {Promise<Array>}
 */
export async function markPyqAccess(tests) {
    if (!tests || tests.length === 0) return tests;

    const patternIds = [...new Set(tests.map(t => t.examPattern?._id || t.examPattern).filter(Boolean))];
    const maxYears = {};

    await Promise.all(patternIds.map(async (patternId) => {
        const maxYearDoc = await mongoose.model('PracticeTest').findOne({ examPattern: patternId, isPYQ: true })
            .sort({ pyqYear: -1 })
            .select('pyqYear')
            .lean();
        if (maxYearDoc) maxYears[patternId.toString()] = maxYearDoc.pyqYear;
    }));

    return tests.map(t => {
        const obj = typeof t.toObject === 'function' ? t.toObject() : { ...t };
        
        if (obj.isPYQ) {
            const maxYear = maxYears[obj.examPattern?._id?.toString() || obj.examPattern?.toString()];
            const isLastYear = obj.pyqYear && obj.pyqYear === maxYear;
            
            obj.isLastYear = isLastYear;
            if (isLastYear) {
                obj.accessLevel = 'FREE';
                obj.isFree = true;
            } else {
                obj.accessLevel = 'PRO';
                obj.isFree = false;
            }
        }
        return obj;
    });
}
