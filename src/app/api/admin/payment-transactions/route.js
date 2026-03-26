import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
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
        if (year && year !== 'all') {
            const currentYear = parseInt(year);
            if (month && month !== 'all' && month !== '0') {
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
            filterQuery.payuStatus = status.toLowerCase();
        } else {
            // Default to successful only as per reference logic? 
            // Actually reference had: filterQuery.payuStatus = 'success';
            // But frontend status filter has options. Let's stick to reference default but allow 'all'
            filterQuery.payuStatus = 'success';
        }

        // Plan filtering
        if (plan && plan !== 'all') {
            filterQuery.planId = plan.toLowerCase();
        }

        // Search filtering
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            filterQuery.$or = [
                { orderId: searchRegex },
                { receipt: searchRegex }
            ];
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

        const [transactions, total] = await Promise.all([
            PaymentOrder.find(filterQuery)
                .populate('user', 'name email phone')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit),
            PaymentOrder.countDocuments(filterQuery)
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: {
                transactions,
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
        console.error('Error getting payment transactions:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch payment transactions',
            error: error.message
        }, { status: 500 });
    }
}
