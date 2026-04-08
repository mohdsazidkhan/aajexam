import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        const user = await User.findById(auth.user.id);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        return NextResponse.json({
            success: true,
            data: {}
        });

    } catch (error) {
        console.error('HomePage data fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
