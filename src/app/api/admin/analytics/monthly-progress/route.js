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
        const currentMonth = new Date().toISOString().slice(0, 7);

        const topUsers = await User.find({
            role: 'student',
            'monthlyProgress.month': currentMonth
        })
            .select('name level monthlyProgress')
            .sort({ 'monthlyProgress.highScoreWins': -1, 'monthlyProgress.accuracy': -1 })
            .limit(50);

        return NextResponse.json({
            success: true,
            data: { month: currentMonth, topUsers }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
