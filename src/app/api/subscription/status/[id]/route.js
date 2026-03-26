import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await User.findById(id);

        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        const isActive = user.subscriptionStatus && user.subscriptionExpiry && new Date() < new Date(user.subscriptionExpiry);

        return NextResponse.json({
            success: true,
            data: {
                planName: user.subscriptionStatus || 'Free',
                status: isActive ? 'active' : 'inactive',
                expiryDate: user.subscriptionExpiry,
                isActive: !!isActive
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
