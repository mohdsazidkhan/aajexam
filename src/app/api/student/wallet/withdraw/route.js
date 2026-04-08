import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WithdrawRequest from '@/models/WithdrawRequest';
import { protect } from '@/middleware/auth';
import { createNotification } from '@/utils/notifications';

const MIN_WITHDRAW_AMOUNT = parseInt(process.env.MIN_WITHDRAW_AMOUNT || '1000', 10);

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const userId = auth.user.id;
        const { amount, bankDetails, upi } = await req.json();

        if (!amount || amount <= 0) return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        if (amount < MIN_WITHDRAW_AMOUNT) return NextResponse.json({ success: false, message: `Min withdrawal ₹${MIN_WITHDRAW_AMOUNT}` }, { status: 400 });
        if ((user.walletBalance || 0) < amount) return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });

        const existingPending = await WithdrawRequest.findOne({ userId, status: 'pending' });
        if (existingPending) return NextResponse.json({ success: false, message: 'Pending request exists' }, { status: 400 });

        const withdrawRequest = await WithdrawRequest.create({
            userId, amount, bankDetails: bankDetails || null, upi: upi || null,
            status: 'pending', requestedAt: new Date()
        });

        await createNotification({
            type: 'withdraw',
            title: 'New withdrawal request',
            description: `Amount ₹${amount} requested`,
            meta: { withdrawRequestId: withdrawRequest._id, amount }
        });

        return NextResponse.json({ success: true, message: 'Withdrawal request created successfully', data: withdrawRequest }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
