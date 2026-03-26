import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

export async function PUT(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        await dbConnect();
        const { username } = await req.json();
        const userId = auth.user.id;

        if (!username) {
            return NextResponse.json({ success: false, message: 'Username is required' }, { status: 400 });
        }

        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return NextResponse.json({
                success: false,
                message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
            }, { status: 400 });
        }

        const existingUser = await User.findOne({
            username: username.toLowerCase(),
            _id: { $ne: userId }
        });

        if (existingUser) {
            return NextResponse.json({ success: false, message: 'Username already taken' }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { username: username.toLowerCase() },
            { new: true }
        ).select('-password');

        return NextResponse.json({
            success: true,
            message: 'Username updated successfully',
            username: user.username
        });
    } catch (error) {
        console.error('Update username error:', error);
        return NextResponse.json({ success: false, message: 'Failed to update username', error: error.message }, { status: 500 });
    }
}
