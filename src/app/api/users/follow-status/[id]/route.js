import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { resolveUserId } from '@/lib/utils/userRef';
import Follow from '@/models/Follow';
import { protect } from '@/middleware/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params; // user id or username
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ isFollowing: false });

        const uid = await resolveUserId(id);
        const isFollowing = uid ? await Follow.exists({ follower: auth.user.id, following: uid, status: 'active' }) : false;
        return NextResponse.json({ success: true, isFollowing: !!isFollowing });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
