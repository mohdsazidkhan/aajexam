import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WithdrawRequest from '@/models/WithdrawRequest';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import UserWallet from '@/models/UserWallet';
import { protect, admin } from '@/middleware/auth';

export async function PATCH(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!['pending', 'approved', 'rejected', 'paid'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        await dbConnect();
        const wr = await WithdrawRequest.findById(id).populate('userId');

        if (!wr) {
            return NextResponse.json({ message: 'Withdraw request not found' }, { status: 404 });
        }

        wr.status = status;

        if (status === 'approved' || status === 'rejected' || status === 'paid') {
            const user = await User.findById(wr.userId);
            if (!user) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            const currentBalance = user.walletBalance || 0;
            await User.findByIdAndUpdate(wr.userId, { $set: { walletBalance: 0 } });

            await WalletTransaction.create({
                user: wr.userId,
                type: 'debit',
                amount: currentBalance,
                balance: 0,
                description: `Withdrawal ${status} - ₹${currentBalance}`,
                category: 'withdrawal',
                status: (status === 'approved' || status === 'paid') ? 'completed' : 'cancelled',
                reference: wr._id.toString(),
                metadata: { withdrawRequestId: wr._id, requestStatus: status, originalAmount: wr.amount }
            });

            if (status === 'paid') {
                wr.processedAt = new Date();
            }
        }

        await wr.save();

        return NextResponse.json({
            success: true,
            data: wr
        });
    } catch (error) {
        console.error('Update withdraw status error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
