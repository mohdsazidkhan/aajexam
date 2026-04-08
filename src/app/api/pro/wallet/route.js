import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserWallet from '@/models/UserWallet';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const userId = auth.user.id;

        const wallet = await UserWallet.findOneAndUpdate(
            { userId },
            { $setOnInsert: { balance: 0, totalEarned: 0 } },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            data: { balance: wallet.balance, totalEarned: wallet.totalEarned }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
