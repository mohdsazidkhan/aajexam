import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import WithdrawRequest from '@/models/WithdrawRequest';
import { protect } from '@/middleware/auth';

const MIN_WITHDRAW_AMOUNT = parseInt(process.env.MIN_WITHDRAW_AMOUNT || '1000', 10);

export async function POST(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const userId = auth.user.id;
        const { amount, upi, bankDetails } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Check minimum withdrawal amount
        if (amount < MIN_WITHDRAW_AMOUNT) {
            return NextResponse.json({
                success: false,
                message: `Minimum withdrawal amount is ₹${MIN_WITHDRAW_AMOUNT}`
            }, { status: 400 });
        }

        // Check wallet balance
        if ((user.walletBalance || 0) < amount) {
            return NextResponse.json({
                success: false,
                message: 'Insufficient wallet balance'
            }, { status: 400 });
        }

        // Check if user is Top Performer
        if (!user.isTopPerformer) {
            return NextResponse.json({
                success: false,
                message: 'You must be a Top Performer in the previous month to withdraw'
            }, { status: 403 });
        }

        // Check if user already has a pending withdrawal request
        const existingPendingRequest = await WithdrawRequest.findOne({
            userId: user._id,
            status: 'pending'
        });

        if (existingPendingRequest) {
            return NextResponse.json({
                success: false,
                message: 'You already have a pending withdrawal request. Please wait for it to be processed.'
            }, { status: 400 });
        }

        // Create withdrawal request
        const withdrawRequest = await WithdrawRequest.create({
            userId: user._id,
            amount,
            bankDetails: bankDetails || null,
            upi: upi || null,
            status: 'pending',
            requestedAt: new Date(),
            metadata: {
                type: 'referral_historical_reward',
                walletBalance: user.walletBalance,
                isTopPerformer: user.isTopPerformer
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Withdrawal request created successfully',
            data: withdrawRequest
        }, { status: 201 });
    } catch (error) {
        console.error('createReferralWithdrawRequest error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
