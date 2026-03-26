import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserWallet from '@/models/UserWallet';
import UserQuestions from '@/models/UserQuestions';
import WithdrawRequest from '@/models/WithdrawRequest';
import { protect } from '@/middleware/auth';
import { createNotification } from '@/utils/notifications';

const MIN_APPROVED_QUESTIONS = parseInt(process.env.MIN_APPROVED_QUESTIONS || '100', 10);
const MIN_WITHDRAW_AMOUNT = parseInt(process.env.MIN_WITHDRAW_AMOUNT || '1000', 10);

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const userId = auth.user.id;
        const { amount, bankDetails, upi } = await req.json();

        if (!amount || amount <= 0) return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
        if (amount < MIN_WITHDRAW_AMOUNT) return NextResponse.json({ message: `Min ₹${MIN_WITHDRAW_AMOUNT} withdrawal` }, { status: 400 });

        const wallet = await UserWallet.findOne({ userId });
        if (!wallet || wallet.balance < amount) return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });

        const approvedCount = await UserQuestions.countDocuments({ userId, status: 'approved' });
        if (approvedCount < MIN_APPROVED_QUESTIONS) return NextResponse.json({ message: `Need ${MIN_APPROVED_QUESTIONS} approved questions` }, { status: 403 });

        const existingPending = await WithdrawRequest.findOne({ userId, status: 'pending' });
        if (existingPending) return NextResponse.json({ message: 'Pending request exists' }, { status: 400 });

        const reqDoc = await WithdrawRequest.create({
            userId, amount, bankDetails: bankDetails || null, upi: upi || null,
            status: 'pending', requestedAt: new Date()
        });

        await createNotification({
            type: 'withdraw',
            title: 'New withdrawal request (Pro)',
            description: `Amount ₹${amount} requested`,
            meta: { withdrawRequestId: reqDoc._id, amount }
        });

        return NextResponse.json({ success: true, data: reqDoc }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
