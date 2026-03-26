import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { protect } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const query = { user: auth.user.id, category: 'bonus', description: { $regex: /Referral reward/i } };

        const [transactions, total, user] = await Promise.all([
            WalletTransaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            WalletTransaction.countDocuments(query),
            User.findById(auth.user.id).select('name email referralCode referralCount walletBalance referralRewards referredBy')
        ]);

        const txWithDetails = await Promise.all(transactions.map(async (tx) => {
            const invitee = tx.metadata?.inviteeUserId ? await User.findById(tx.metadata.inviteeUserId).select('name email').lean() : null;
            return { 
                ...tx, 
                date: tx.createdAt, // Map createdAt to date for frontend
                rewardType: tx.metadata?.referralType || 'registration', // Map metadata.referralType to rewardType
                invitee 
            };
        }));

        return NextResponse.json({
            success: true,
            data: {
                user,
                transactions: txWithDetails,
                pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
