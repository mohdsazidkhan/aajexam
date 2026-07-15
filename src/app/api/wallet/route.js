import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import WithdrawRequest from '@/models/WithdrawRequest';
import { protect } from '@/middleware/auth';

const MIN_WITHDRAW_AMOUNT = parseInt(process.env.MIN_WITHDRAW_AMOUNT || '1000', 10);

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const user = await User.findById(auth.user.id).select(
            'walletBalance referralRewards referralCode referredBy subscriptionStatus'
        );
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const isPro = (user.subscriptionStatus || '').toUpperCase() === 'PRO';

        const [transactions, pendingRequest, withdrawalRequests] = await Promise.all([
            WalletTransaction.find({ user: auth.user.id }).sort({ createdAt: -1 }).limit(50).lean(),
            WithdrawRequest.findOne({ userId: auth.user.id, status: 'pending' }).select('amount requestedAt status').lean(),
            WithdrawRequest.find({ userId: auth.user.id }).sort({ requestedAt: -1 }).limit(20).lean()
        ]);

        // Per-category credit totals — used only to show the earnings breakdown.
        // The authoritative balance is the User.walletBalance field (below), NOT a
        // re-derivation from transactions, so the two can never drift.
        const categoryAgg = await WalletTransaction.aggregate([
            {
                $match: {
                    user: user._id,
                    status: 'completed',
                    type: 'credit',
                    category: { $in: ['blog_reward', 'question_reward', 'bonus', 'referral', 'registration_bonus'] }
                }
            },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        // Map categories to labels
        const rewardBreakdown = {
            blog_reward: 0,
            question_reward: 0,
            referral: 0,
            bonus: 0
        };

        categoryAgg.forEach(item => {
            if (item._id === 'registration_bonus') {
                rewardBreakdown.bonus += item.total;
            } else if (rewardBreakdown.hasOwnProperty(item._id)) {
                rewardBreakdown[item._id] = item.total;
            }
        });

        // Single source of truth: the canonical wallet field. Withdrawals debit
        // this exact field, so display and withdrawal can never disagree.
        const walletBalance = Number(user.walletBalance || 0);

        // Free users see a "locked balance" — full psychological hook
        const lockedBalance   = !isPro ? walletBalance : 0; // All existing balance is locked for free users
        const availableBalance = isPro ? walletBalance : 0;  // Only PRO can withdraw

        // canWithdraw: PRO required, minimum balance, no pending request
        const canWithdraw = isPro && walletBalance >= MIN_WITHDRAW_AMOUNT && !pendingRequest;

        // Upgrade prompt: shown when free user has earned rewards
        const showUpgradePrompt = !isPro && walletBalance > 0;
        const upgradeMessage = showUpgradePrompt
            ? `₹${walletBalance} waiting in your wallet. Upgrade to PRO for ₹99 to withdraw your earnings!`
            : null;

        return NextResponse.json({
            success: true,
            data: {
                walletBalance,
                availableBalance,
                lockedBalance,
                rewardBreakdown, // Added breakdown
                referralCode:    user.referralCode,
                referredBy:      user.referredBy,
                referralRewards: user.referralRewards || [],
                transactions,
                // Withdrawal fields
                canWithdraw,
                minWithdrawAmount: MIN_WITHDRAW_AMOUNT,
                hasPendingRequest: !!pendingRequest,
                pendingRequest,
                withdrawalRequests,
                // Free-play model fields
                isPro,
                showUpgradePrompt,
                upgradeMessage,
                // Earning summary placeholder
                competitionEarnings: null
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// NOTE: The POST handler that used to live here created a withdrawal request and
// debited the wallet at REQUEST time — contradicting the app's deduct-on-approval
// model and never mirroring UserWallet. No client called it (web + mobile both use
// /api/wallet/withdraw and /api/withdrawRequests/create), so it was removed to
// close a double-deduct landmine. Withdrawals go through those two routes only.
