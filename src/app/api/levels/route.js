import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const user = await User.findById(auth.user.id);
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        const levelInfo = await user.getLevelInfo();

        return NextResponse.json({
            success: true,
            data: {
                level: levelInfo,
                user: { _id: user._id, name: user.name, badges: user.badges, subscriptionStatus: user.subscriptionStatus }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
