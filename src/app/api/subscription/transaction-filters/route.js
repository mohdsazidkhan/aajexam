import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const userId = auth.user.id;

        // Aggregate across ALL of the user's payment orders (success, failed,
        // pending, refunded) so the date dropdown reflects every month they've
        // ever had any payment activity — not just successful ones.
        const dates = await PaymentOrder.aggregate([
            { $match: { user: userId } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } } } },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        const years = [...new Set(dates.map(d => d._id.year))];
        const months = [
            { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
            { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
            { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
            { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
        ];

        return NextResponse.json({
            success: true,
            data: {
                years,
                months,
                availableDates: dates.map(d => ({ year: d._id.year, month: d._id.month, monthName: months[d._id.month - 1].label }))
            }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
