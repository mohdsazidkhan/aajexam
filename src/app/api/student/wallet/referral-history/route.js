import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const userId = auth.user.id;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const type = searchParams.get('type');
        const skip = (page - 1) * limit;

        const query = { user: userId, category: 'bonus', description: { $regex: /Referral reward/i } };
        if (type && type !== 'all') query['metadata.referralType'] = type;

        const [transactions, total, user] = await Promise.all([
            WalletTransaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            WalletTransaction.countDocuments(query),
            User.findById(userId).select('name email referralCode referredBy walletBalance referralCount')
        ]);

        const transactionsWithDetails = await Promise.all(
            transactions.map(async (tx) => {
                const invitee = tx.metadata?.inviteeUserId ? await User.findById(tx.metadata.inviteeUserId).select('name email') : null;
                return {
                    _id: tx._id,
                    invitee: invitee ? { _id: invitee._id, name: invitee.name, email: invitee.email } : null,
                    rewardType: tx.metadata?.referralType || 'unknown',
                    amount: tx.amount,
                    description: tx.description,
                    date: tx.createdAt,
                    balance: tx.balance
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: {
                user,
                transactions: transactionsWithDetails,
                pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
