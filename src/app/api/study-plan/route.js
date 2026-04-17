import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyPlan from '@/models/StudyPlan';
import { protect } from '@/middleware/auth';

// GET - Get user's study plans
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: 'Login required' }, { status: 401 });
        }
        await dbConnect();

        const plans = await StudyPlan.find({ user: auth.user._id })
            .populate('exam', 'name code')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: plans });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
