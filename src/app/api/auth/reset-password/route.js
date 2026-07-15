import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(req) {
    try {
        // Throttle reset-token brute-force: 10 / 15 min / IP.
        const limited = await enforceRateLimit(req, { name: 'reset-password', limit: 10, windowSec: 900 });
        if (limited) return limited;

        await dbConnect();
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ message: 'Token and new password are required' }, { status: 400 });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ message: 'Password reset token is invalid or has expired' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Use updateOne to avoid re-validating unrelated fields (e.g. subscriptionStatus)
        // that may have stale/legacy values in the database
        await User.updateOne(
            { _id: user._id },
            {
                $set: { password: hashedPassword },
                $unset: { resetPasswordToken: "", resetPasswordExpires: "" }
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
