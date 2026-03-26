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
        const { isPublicProfile, bio } = await req.json();
        const userId = auth.user.id;

        const updateData = {};
        if (typeof isPublicProfile !== 'undefined') updateData.isPublicProfile = isPublicProfile;
        if (typeof bio !== 'undefined') updateData.bio = bio ? bio.substring(0, 200) : '';

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        return NextResponse.json({
            success: true,
            message: 'Profile settings updated successfully',
            user: {
                isPublicProfile: user.isPublicProfile,
                bio: user.bio
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
    }
}
