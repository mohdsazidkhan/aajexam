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
        let wr = await WithdrawRequest.findById(id).populate('userId');

        if (!wr) {
            return NextResponse.json({ message: 'Withdraw request not found' }, { status: 404 });
        }

        const uid = wr.userId?._id || wr.userId;
        const settleKey = `withdraw-${wr._id}-debit`;
        const cancelKey = `withdraw-${wr._id}-cancel`;
        // Balance is deducted only once, when the request first leaves a non-settled
        // state. approved -> paid must NOT deduct again.
        const alreadySettled = ['approved', 'paid'].includes(wr.status);

        if (status === 'approved' || status === 'paid') {
            if (!alreadySettled) {
                // Atomically claim the settlement so a concurrent PATCH (admin double-click,
                // duplicate request) can never deduct twice — only the first winner deducts.
                const claim = await WithdrawRequest.findOneAndUpdate(
                    { _id: wr._id, status: { $nin: ['approved', 'paid'] } },
                    { $set: { status } },
                    { new: true }
                );

                if (claim) {
                    // Deduct EXACTLY the requested amount from the canonical balance,
                    // atomically and never below zero.
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: uid, walletBalance: { $gte: wr.amount } },
                        { $inc: { walletBalance: -wr.amount } },
                        { new: true }
                    );
                    if (!updatedUser) {
                        // Roll back the claim so the request stays actionable.
                        await WithdrawRequest.updateOne({ _id: wr._id }, { $set: { status: wr.status } });
                        return NextResponse.json({ message: 'User has insufficient balance for this withdrawal amount' }, { status: 400 });
                    }
                    // Keep the legacy UserWallet mirror in lock-step with the canonical balance.
                    await UserWallet.updateOne({ userId: uid }, { $inc: { balance: -wr.amount } });

                    await WalletTransaction.create({
                        user: uid,
                        type: 'debit',
                        amount: wr.amount,
                        balance: updatedUser.walletBalance,
                        description: `Withdrawal ${status} - ₹${wr.amount}`,
                        category: 'withdrawal',
                        status: 'completed',
                        reference: wr._id.toString(),
                        idempotencyKey: settleKey,
                        metadata: { withdrawRequestId: wr._id, requestStatus: status, requestedAmount: wr.amount }
                    });
                }
                // if !claim: a concurrent PATCH already settled — nothing to deduct here.
            }

            const patch = { status };
            if (status === 'paid') patch.processedAt = new Date();
            wr = await WithdrawRequest.findByIdAndUpdate(wr._id, { $set: patch }, { new: true });

        } else if (status === 'rejected') {
            // Reject NEVER touches the balance — just record a cancelled tx for the audit trail.
            const cur = await User.findById(uid).select('walletBalance').lean();
            await WalletTransaction.updateOne(
                { idempotencyKey: cancelKey },
                { $setOnInsert: {
                    user: uid,
                    type: 'debit',
                    amount: wr.amount,
                    balance: cur?.walletBalance || 0,
                    description: `Withdrawal rejected - ₹${wr.amount}`,
                    category: 'withdrawal',
                    status: 'cancelled',
                    reference: wr._id.toString(),
                    idempotencyKey: cancelKey,
                    metadata: { withdrawRequestId: wr._id, requestStatus: 'rejected', requestedAmount: wr.amount }
                } },
                { upsert: true }
            );
            wr = await WithdrawRequest.findByIdAndUpdate(wr._id, { $set: { status: 'rejected', processedAt: new Date() } }, { new: true });

        } else {
            // 'pending' or any other no-op status.
            wr = await WithdrawRequest.findByIdAndUpdate(wr._id, { $set: { status } }, { new: true });
        }

        return NextResponse.json({
            success: true,
            data: wr
        });
    } catch (error) {
        console.error('Update withdraw status error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
