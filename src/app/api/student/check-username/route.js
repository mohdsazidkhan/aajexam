import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ success: false, message: 'Username is required' }, { status: 400 });
        }

        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return NextResponse.json({
                success: true,
                available: false,
                message: 'Username must be 3-20 characters'
            });
        }

        // Optional auth check for current user exclude
        let userId = null;
        const auth = await protect(req);
        if (auth.authenticated) userId = auth.user.id;

        const query = { username: username.toLowerCase() };
        if (userId) query._id = { $ne: userId };

        const existingUser = await User.findOne(query);

        return NextResponse.json({
            success: true,
            available: !existingUser,
            message: existingUser ? 'Username is already taken' : 'Username is available'
        });
    } catch (error) {
        console.error('Check username availability error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
