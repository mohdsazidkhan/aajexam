import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import UserWallet from '@/models/UserWallet';

export async function applyReferralRewards(user, planId, planPrice) {
    try {
        const rewardMap = {
            'pro': { type: 'plan99', inviterReward: parseInt(process.env.NEXT_PUBLIC_REFERRAL_REWARD_PRO) || 33, price: 99 }
        };

        const reward = rewardMap[planId];
        if (!reward) return;

        const subscriptionHistory = user.subscriptionHistory || [];
        const isFirstTime = !subscriptionHistory.some(sub => sub.type === reward.type && sub.firstTime === true);

        if (!isFirstTime) return;

        await User.findByIdAndUpdate(user._id, {
            $push: {
                subscriptionHistory: {
                    type: reward.type,
                    price: planPrice,
                    purchasedAt: new Date(),
                    firstTime: true
                }
            }
        });

        if (user.referredBy) {
            const inviter = await User.findOne({ referralCode: user.referredBy });
            // Skip self-referral — an inviter can never earn a reward off their own purchase.
            if (inviter && String(inviter._id) !== String(user._id)) {
                const inviterReward = reward.inviterReward;

                // Idempotency: one reward per (inviter, invitee, plan). If a PayU server
                // callback and the browser verify both fire (or activation otherwise runs
                // twice), the unique idempotencyKey index rejects the duplicate and we bail
                // out BEFORE crediting — so the inviter is never paid twice.
                const idempotencyKey = `referral-${inviter._id}-${user._id}-${reward.type}`;

                try {
                    await WalletTransaction.create({
                        user: inviter._id,
                        type: 'credit',
                        amount: inviterReward,
                        balance: (inviter.walletBalance || 0) + inviterReward,
                        description: `Referral reward: Friend purchased ₹${planPrice} plan (first time)`,
                        category: 'bonus',
                        status: 'completed',
                        idempotencyKey,
                        metadata: { referralType: reward.type, planId, planPrice, inviteeUserId: user._id }
                    });
                } catch (e) {
                    if (e && e.code === 11000) return; // already rewarded for this pair
                    throw e;
                }

                // Credit only AFTER the idempotent transaction was recorded successfully.
                await User.findByIdAndUpdate(inviter._id, {
                    $inc: { walletBalance: inviterReward },
                    $push: {
                        referralRewards: { type: reward.type, amount: inviterReward, date: new Date() }
                    }
                });

                // Keep the UserWallet mirror in lock-step with the canonical balance.
                await UserWallet.updateOne(
                    { userId: inviter._id },
                    { $inc: { balance: inviterReward, totalEarned: inviterReward } },
                    { upsert: true }
                );
            }
        }
    } catch (error) {
        console.error('Apply referral rewards error:', error);
    }
}
