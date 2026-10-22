import { NextResponse } from 'next/server';
import { escapeRegex } from '@/lib/utils/pagination';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import BankDetail from '@/models/BankDetail';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 1000);
        const skip = (page - 1) * limit;

        const search = (searchParams.get('search') || '').trim().slice(0, 100);
        const filter = {};
        if (search) {
            const rx = new RegExp(escapeRegex(search), 'i');
            const users = await User.find({ $or: [{ name: rx }, { email: rx }, { phone: rx }] }).select('_id').limit(500).lean();
            filter.$or = [{ accountNumber: rx }, { user: { $in: users.map(u => u._id) } }];
        }

        const [bankDetails, total] = await Promise.all([
            BankDetail.find(filter)
                .populate('user', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            BankDetail.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            bankDetails,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
