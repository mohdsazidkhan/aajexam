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

        // PRO CHECK: Study Plan is a PRO feature
        if (auth.user.subscriptionStatus !== 'pro' && auth.user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'AI Study Plan is a PRO feature. Upgrade to get a customized roadmap!',
                isLocked: true
            }, { status: 403 });
        }

        const plans = await StudyPlan.find({ user: auth.user._id })
            .populate('exam', 'name code')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: plans });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
