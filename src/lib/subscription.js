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
    const normalizedPlan = (planId || '').toLowerCase();

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
