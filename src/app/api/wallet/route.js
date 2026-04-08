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

        const isPro = user.subscriptionStatus === 'pro';

        const [transactions, pendingRequest, withdrawalRequests] = await Promise.all([
            WalletTransaction.find({ user: auth.user.id }).sort({ createdAt: -1 }).limit(50).lean(),
            WithdrawRequest.findOne({ userId: auth.user.id, status: 'pending' }).select('amount requestedAt status').lean(),
            WithdrawRequest.find({ userId: auth.user.id }).sort({ requestedAt: -1 }).limit(20).lean()
        ]);

        // ── Transaction-Based Wallet Calculation ──────────────────────────────
        // All wallet related amounts coming from WalletTransaction & WithdrawRequest
        const [categoryAgg, debitAgg] = await Promise.all([
            WalletTransaction.aggregate([
                {
                    $match: {
                        user: user._id,
                        status: 'completed',
                        type: 'credit',
                        category: { $in: ['blog_reward', 'question_reward', 'bonus', 'referral', 'registration_bonus'] }
                    }
                },
                { $group: { _id: '$category', total: { $sum: '$amount' } } }
            ]),
            WithdrawRequest.aggregate([
                {
                    $match: {
                        userId: user._id,
                        status: 'paid'
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        // Map categories to labels
        const rewardBreakdown = {
            blog_reward: 0,
            question_reward: 0,
            referral: 0,
            bonus: 0
        };

        let totalCredits = 0;
        categoryAgg.forEach(item => {
            if (item._id === 'registration_bonus') {
                rewardBreakdown.bonus += item.total;
            } else if (rewardBreakdown.hasOwnProperty(item._id)) {
                rewardBreakdown[item._id] = item.total;
            }
            totalCredits += item.total;
        });

        const totalPaid = debitAgg[0]?.total || 0;
        const walletBalance = totalCredits - totalPaid;

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

export async function POST(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { amount, bankDetails, upi } = await req.json();

        // ── Validate ─────────────────────────────────────────────────────────
        if (!amount || isNaN(amount) || amount < MIN_WITHDRAW_AMOUNT) {
            return NextResponse.json({ message: `Minimum withdrawal is ₹${MIN_WITHDRAW_AMOUNT}` }, { status: 400 });
        }
        if (!bankDetails && !upi) {
            return NextResponse.json({ message: 'Provide bank details or UPI ID' }, { status: 400 });
        }

        // ── PRO check — only gate is at withdrawal ────────────────────────────
        const user = await User.findById(auth.user.id);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        if (user.subscriptionStatus !== 'pro') {
            return NextResponse.json({
                message: `Upgrade to PRO to withdraw your ₹${user.walletBalance} earnings. PRO plan is just ₹99/month!`,
                upgradeRequired: true,
                walletBalance: user.walletBalance
            }, { status: 403 });
        }

        if (user.walletBalance < amount) {
            return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
        }

        const existing = await WithdrawRequest.findOne({ userId: auth.user.id, status: 'pending' });
        if (existing) {
            return NextResponse.json({ message: 'You already have a pending withdrawal request' }, { status: 400 });
        }

        // ── Atomic debit + request creation ──────────────────────────────────
        const session = await (await import('mongoose')).default.startSession();
        session.startTransaction();
        try {
            // Atomic check-and-deduct: prevents race condition on double-submit
            const updatedUser = await User.findOneAndUpdate(
                { _id: auth.user.id, walletBalance: { $gte: amount } },
                { $inc: { walletBalance: -amount } },
                { new: true, session }
            );
            if (!updatedUser) {
                await session.abortTransaction();
                return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
            }

            const request = await WithdrawRequest.create([{
                userId: auth.user.id,
                amount,
                bankDetails,
                upi,
                status: 'pending',
                requestedAt: new Date()
            }], { session });

            await WalletTransaction.create([{
                user: auth.user.id,
                type: 'debit',
                amount,
                balance: updatedUser.walletBalance,
                description: 'Withdrawal request submitted',
                category: 'withdrawal',
                reference: request[0]._id.toString(),
                status: 'pending'
            }], { session });

            await session.commitTransaction();
            return NextResponse.json({
                success: true,
                message: 'Withdrawal request submitted. Processing in 2-3 business days.',
                data: request[0]
            }, { status: 201 });

        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
