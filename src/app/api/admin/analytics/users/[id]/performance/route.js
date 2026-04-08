import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { id } = params;
        await dbConnect();

        const user = await User.findById(id).select('name level subscriptionStatus');
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        return NextResponse.json({
            success: true,
            data: {
                user,
                performance: {
                    totalAttempts: 0,
                    averageScore: 0,
                    perfectScores: 0
                }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
