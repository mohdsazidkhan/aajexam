import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserWallet from '@/models/UserWallet';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const sortBy = searchParams.get('sortBy') || 'walletBalance';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;

        // Map frontend sort keys to database fields
        const sortField = sortBy === 'amount' ? 'walletBalance' : sortBy;

        let query = {};
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query = {
                $or: [
                    { name: regex },
                    { email: regex },
                    { phone: regex }
                ]
            };
        }

        const students = await User.find({ ...query, role: 'student' })
            .select('name email phone walletBalance referralCount referralEarnings status subscriptionStatus createdAt')
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments({ ...query, role: 'student' });
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            students,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        console.error('Admin user-wallets error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
