import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

export async function POST(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { userId } = params;
        const { plan, duration } = await req.json();

        if (!plan || !duration) {
            return NextResponse.json({ success: false, message: 'Plan and duration are required' }, { status: 400 });
        }

        await dbConnect();

        const student = await User.findById(userId);
        if (!student) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Parse duration (e.g., "1 month", "1 year")
        const durationMatch = duration.match(/(\d+)\s*(month|year|months|years)/i);
        if (!durationMatch) {
            return NextResponse.json({ success: false, message: 'Invalid duration format' }, { status: 400 });
        }

        const durationValue = parseInt(durationMatch[1]);
        const durationUnit = durationMatch[2].toLowerCase();

        // Calculate new expiry date
        let currentExpiry = student.subscriptionExpiry && new Date(student.subscriptionExpiry) > new Date()
            ? new Date(student.subscriptionExpiry)
            : new Date();

        if (durationUnit.startsWith('month')) {
            currentExpiry.setMonth(currentExpiry.getMonth() + durationValue);
        } else if (durationUnit.startsWith('year')) {
            currentExpiry.setFullYear(currentExpiry.getFullYear() + durationValue);
        }

        student.subscriptionStatus = plan.toLowerCase();
        student.subscriptionExpiry = currentExpiry;
        await student.save();

        return NextResponse.json({
            success: true,
            message: `Subscription ${student.subscriptionStatus === 'free' ? 'removed' : 'extended'} successfully`,
            data: {
                subscriptionStatus: student.subscriptionStatus,
                subscriptionExpiry: student.subscriptionExpiry
            }
        });
    } catch (error) {
        console.error('Error extending subscription:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to extend subscription',
            error: error.message
        }, { status: 500 });
    }
}
