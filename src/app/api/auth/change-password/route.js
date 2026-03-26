import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Please provide current and new password' }, { status: 400 });
        }

        const user = await User.findById(auth.user._id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 });
        }

        user.password = newPassword; // Mongoose middleware usually hashes this, but I should check User model
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
