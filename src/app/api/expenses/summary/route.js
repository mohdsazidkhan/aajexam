import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        // General summary
        const summary = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Category summary
        const categorySummary = await Expense.aggregate([
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalAmount: summary[0]?.totalAmount || 0,
                count: summary[0]?.count || 0,
                categories: categorySummary
            }
        });
    } catch (error) {
        console.error('Error getting expense summary:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch expense summary',
            error: error.message
        }, { status: 500 });
    }
}
