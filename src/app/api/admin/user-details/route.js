import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
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
        // If userId is provided, return single user
        const userId = searchParams.get('userId');
        if (userId) {
            const user = await User.findById(userId)
                .select('name email phone username role subscriptionStatus socialLinks referralCode referredBy referralCount walletBalance referralRewards createdAt');

            if (!user) {
                return NextResponse.json({
                    success: false,
                    message: 'User not found'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                user: user.toObject()
            });
        }

        // Otherwise return paginated list
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;
        const search = searchParams.get('search');

        let query = { role: 'student' };
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { name: regex },
                { email: regex },
                { username: regex }
            ];
        }

        const users = await User.find(query)
            .select('name email phone username role subscriptionStatus socialLinks createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const mappedUsers = users.map((user) => user.toObject());

        const total = await User.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
                users: mappedUsers,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Admin user-details error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch user details.',
            error: error.message
        }, { status: 500 });
    }
}
