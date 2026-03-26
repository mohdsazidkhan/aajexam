import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        // Get available years
        const years = await PaymentOrder.distinct('createdAt', {})
            .then(dates => [...new Set(dates.map(date => new Date(date).getFullYear()))])
            .then(years => years.sort((a, b) => b - a));

        // Fallback to current year if no transactions exist
        if (years.length === 0) {
            years.push(new Date().getFullYear());
        }

        // Get available months (static 1-12)
        const months = Array.from({ length: 12 }, (_, i) => i + 1);

        // Get available plans
        const plans = await PaymentOrder.distinct('planId');

        // Available payuStatus values
        const payuStatuses = ['success', 'failed', 'pending'];

        return NextResponse.json({
            success: true,
            data: {
                years,
                months: months.map(m => ({ value: m, label: new Date(0, m - 1).toLocaleString('default', { month: 'long' }) })),
                plans: plans.filter(plan => plan).map(plan => plan.charAt(0).toUpperCase() + plan.slice(1)),
                statuses: payuStatuses.map(status => status.charAt(0).toUpperCase() + status.slice(1))
            }
        });
    } catch (error) {
        console.error('Error getting payment transaction filter options:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch filter options',
            error: error.message
        }, { status: 500 });
    }
}
