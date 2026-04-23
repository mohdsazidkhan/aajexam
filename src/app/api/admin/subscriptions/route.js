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

        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const year = searchParams.get('year');
        const month = searchParams.get('month');
        const status = searchParams.get('status');
        const plan = searchParams.get('plan');
        const search = searchParams.get('search');
        const sortField = searchParams.get('sortField') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build filter query
        const filterQuery = {};

        // Date filtering
        if (year && year !== 'all' && year !== '') {
            const currentYear = parseInt(year);
            if (month && month !== 'all' && month !== '0' && month !== '') {
                const currentMonth = parseInt(month);
                const startDate = new Date(currentYear, currentMonth - 1, 1);
                const endDate = new Date(currentYear, currentMonth, 1);
                filterQuery.createdAt = { $gte: startDate, $lt: endDate };
            } else {
                const startDate = new Date(currentYear, 0, 1);
                const endDate = new Date(currentYear + 1, 0, 1);
                filterQuery.createdAt = { $gte: startDate, $lt: endDate };
            }
        }

        // Status filtering
        if (status && status !== 'all') {
            if (status === 'active') {
                filterQuery.subscriptionExpiry = { $exists: true, $ne: null, $gt: new Date() };
            } else if (status === 'inactive') {
                filterQuery.$or = [
                    { subscriptionExpiry: { $exists: false } },
                    { subscriptionExpiry: null },
                    { subscriptionExpiry: { $lte: new Date() } }
                ];
            } else if (status === 'expired') {
                filterQuery.subscriptionExpiry = { $lte: new Date() };
            }
        }

        // Plan filtering
        if (plan && plan !== 'all') {
            filterQuery.subscriptionStatus = plan.toUpperCase();
        }

        // Search filtering
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            filterQuery.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ];
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

        const [users, total] = await Promise.all([
            User.find(filterQuery)
                .select('name email phone subscriptionStatus subscriptionExpiry createdAt')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit),
            User.countDocuments(filterQuery)
        ]);

        // Transform users to subscription format expected by frontend
        const subscriptions = users.map(user => {
            const isSubscriptionActive = user.subscriptionStatus === 'FREE' ||
                (user.subscriptionStatus && user.subscriptionExpiry && new Date() < new Date(user.subscriptionExpiry));

            return {
                _id: user._id,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                },
                planName: user.subscriptionStatus || 'FREE',
                status: isSubscriptionActive ? 'active' : (user.subscriptionExpiry && new Date() > new Date(user.subscriptionExpiry) ? 'expired' : 'inactive'),
                startDate: user.createdAt,
                expiryDate: user.subscriptionExpiry,
                amount: user.subscriptionStatus === 'PRO' ? 99 : 0,
                paymentMethod: 'payu',
                createdAt: user.createdAt
            };
        });

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
                subscriptions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    total,
                    limit,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error getting subscriptions:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch subscriptions',
            error: error.message
        }, { status: 500 });
    }
}
