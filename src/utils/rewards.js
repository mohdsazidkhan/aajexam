import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';

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
            if (inviter) {
                const inviterReward = reward.inviterReward;
                const inviterNewBalance = (inviter.walletBalance || 0) + inviterReward;

                await User.findByIdAndUpdate(inviter._id, {
                    $inc: { walletBalance: inviterReward },
                    $push: {
                        referralRewards: { type: reward.type, amount: inviterReward, date: new Date() }
                    }
                });

                await WalletTransaction.create({
                    user: inviter._id,
                    type: 'credit',
                    amount: inviterReward,
                    balance: inviterNewBalance,
                    description: `Referral reward: Friend purchased ₹${planPrice} plan (first time)`,
                    category: 'bonus',
                    status: 'completed',
                    metadata: { referralType: reward.type, planId, planPrice, inviteeUserId: user._id }
                });
            }
        }
    } catch (error) {
        console.error('Apply referral rewards error:', error);
    }
}
