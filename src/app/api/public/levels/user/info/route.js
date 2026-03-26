import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(auth.user._id).select('level badges');
        
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('User level info error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
