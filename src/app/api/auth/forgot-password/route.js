import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req) {
    try {
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if user exists. 
            // Return success but don't actually send email in this stub.
            return NextResponse.json({
                success: true,
                message: 'If an account exists with that email, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // In a real implementation, you would send an email here.
        // For now, we'll return the token in the response for development/testing visibility.
        return NextResponse.json({
            success: true,
            message: 'Password reset link sent to your email.',
            debugToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
