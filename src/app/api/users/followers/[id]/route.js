import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Follow from '@/models/Follow';
import User from '@/models/User';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const followers = await Follow.find({ following: id, status: 'active' })
            .populate('follower', 'name username profilePicture followersCount followingCount')
            .skip(skip).limit(limit).sort({ createdAt: -1 });

        const total = await Follow.countDocuments({ following: id, status: 'active' });

        return NextResponse.json({
            success: true,
            followers: followers.map(f => f.follower).filter(f => f),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
