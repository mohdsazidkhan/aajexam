import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserWallet from '@/models/UserWallet';
import WithdrawRequest from '@/models/WithdrawRequest';
import { protect, proOnly } from '@/middleware/auth';

const MIN_WITHDRAW_AMOUNT = parseInt(process.env.MIN_WITHDRAW_AMOUNT || '1000', 10);

export async function POST(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) {
            return NextResponse.json({ success: false, message: 'Pro access required' }, { status: 403 });
        }

        const userId = auth.user.id;
        const { amount, bankDetails, upi } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
        }

        if (amount < MIN_WITHDRAW_AMOUNT) {
            return NextResponse.json({ success: false, message: `Minimum withdrawal amount is ₹${MIN_WITHDRAW_AMOUNT}` }, { status: 400 });
        }

        const wallet = await UserWallet.findOneAndUpdate(
            { userId },
            { $setOnInsert: { balance: 0, totalEarned: 0 } },
            { upsert: true, new: true }
        );

        if (wallet.balance < amount) {
            return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });
        }

        // Check for pending request
        const existing = await WithdrawRequest.findOne({ userId, status: 'pending' });
        if (existing) {
            return NextResponse.json({ success: false, message: 'You already have a pending withdrawal request' }, { status: 400 });
        }

        const reqDoc = await WithdrawRequest.create({
            userId,
            amount,
            bankDetails: bankDetails || null,
            upi: upi || null,
            status: 'pending',
            requestedAt: new Date(),
            metadata: {
                type: 'pro_questions_reward'
            }
        });

        // Deduct from balance (optional, usually done on approval, but aajexam-backend doesn't seem to deduct here)
        // wallet.balance -= amount;
        // await wallet.save();

        return NextResponse.json({ success: true, data: reqDoc, message: 'Withdrawal request submitted successfully' }, { status: 201 });
    } catch (error) {
        console.error('createProWithdrawRequest error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
