import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Follow from '@/models/Follow';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ isFollowing: false });

        const isFollowing = await Follow.exists({ follower: auth.user.id, following: id, status: 'active' });
        return NextResponse.json({ success: true, isFollowing: !!isFollowing });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
