import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page'));
        const limit = parseInt(searchParams.get('limit'));
        const search = searchParams.get('search');

        let query = { role: 'student' };
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
        }
        if (!isNaN(page) && !isNaN(limit)) {
            const skip = (page - 1) * limit;
            const students = await User.find(query)
                .select('name email phone username walletBalance role subscriptionStatus referralCode status socialLinks createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await User.countDocuments(query);
            const totalPages = Math.ceil(total / limit);

            return NextResponse.json({
                success: true,
                students,
                pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
            });
        } else {
            const students = await User.find(query)
                .select('name email phone username walletBalance role subscriptionStatus referralCode status socialLinks createdAt')
                .sort({ createdAt: -1 });

            return NextResponse.json({ success: true, students });
        }
    } catch (error) {
        console.error('Admin students error:', error);
        return NextResponse.json({ success: false, error: 'Failed to get students' }, { status: 500 });
    }
}
