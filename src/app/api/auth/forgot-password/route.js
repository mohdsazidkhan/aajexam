import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
const { sendBrevoEmail } = require('@/utils/email');
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(req) {
    try {
        // Throttle reset-email spam / user enumeration: 4 / 15 min / IP.
        const limited = await enforceRateLimit(req, { name: 'forgot-password', limit: 4, windowSec: 900 });
        if (limited) return limited;

        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if user exists.
            return NextResponse.json({
                success: true,
                message: 'If an account exists with that email, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Use updateOne to avoid re-validating unrelated fields (e.g. subscriptionStatus)
        // that may have stale/legacy values in the database
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires: Date.now() + 3600000 // 1 hour
                }
            }
        );

        // Build reset link
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
        const resetLink = `${siteUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        // Send email via Brevo
        await sendBrevoEmail({
            to: email,
            subject: 'Reset Your AajExam Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">AajExam</p>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <p style="color: #333; font-size: 16px;">Hi <strong>${user.name || 'User'}</strong>,</p>
                        <p style="color: #555; font-size: 15px; line-height: 1.6;">
                            We received a request to reset your password. Click the button below to create a new password. This link is valid for <strong>1 hour</strong>.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
                                Reset My Password
                            </a>
                        </div>
                        <p style="color: #888; font-size: 13px; line-height: 1.6;">
                            If the button doesn't work, copy and paste this link into your browser:<br/>
                            <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
                        <p style="color: #aaa; font-size: 12px; text-align: center;">
                            If you didn't request this, you can safely ignore this email. Your password won't change.<br/>
                            &copy; ${new Date().getFullYear()} AajExam. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            message: 'Password reset link sent to your email.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

