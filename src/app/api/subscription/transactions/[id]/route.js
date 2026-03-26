import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const transactions = await WalletTransaction.find({
            user: id,
            type: { $in: ['subscription_payment', 'subscription_purchase', 'subscription_renewal'] }
        }).sort({ createdAt: -1 });

        const transformed = transactions.map(tx => ({
            planName: tx.description?.includes('Basic') ? 'Basic' :
                tx.description?.includes('Premium') ? 'Premium' :
                    tx.description?.includes('Pro') ? 'Pro' : 'Subscription',
            amount: tx.amount,
            status: 'completed',
            createdAt: tx.createdAt
        }));

        return NextResponse.json({ success: true, data: transformed });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
