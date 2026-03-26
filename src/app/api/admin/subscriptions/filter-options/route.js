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

        // Get available years from User createdAt dates
        const years = await User.distinct('createdAt', {})
            .then(dates => {
                const yearSet = new Set(dates.map(date => new Date(date).getFullYear()));
                return Array.from(yearSet).sort((a, b) => b - a);
            });

        // Fallback to current year if no users exist
        if (years.length === 0) {
            years.push(new Date().getFullYear());
        }

        // Get available plans
        const plans = await User.distinct('subscriptionStatus', { subscriptionStatus: { $ne: null } });

        // Months static
        const months = Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
            value: m,
            label: new Date(0, m - 1).toLocaleString('default', { month: 'long' })
        }));

        return NextResponse.json({
            success: true,
            data: {
                years,
                months,
                plans: plans.filter(p => p).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
                statuses: ['Active', 'Inactive', 'Expired', 'Cancelled']
            }
        });
    } catch (error) {
        console.error('Error getting subscription filter options:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch filter options',
            error: error.message
        }, { status: 500 });
    }
}
