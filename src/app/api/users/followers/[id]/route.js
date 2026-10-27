import { escapeRegex } from '@/lib/utils/pagination';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { resolveUserId } from '@/lib/utils/userRef';
import Follow from '@/models/Follow';
import User from '@/models/User';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params; // user id or username
        const uid = await resolveUserId(id);
        if (!uid) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 200);
        const skip = (page - 1) * limit;

        const search = (searchParams.get('search') || '').trim().slice(0, 100);
        const baseFilter = { following: uid, status: 'active' };
        if (search) {
            const rx = new RegExp(escapeRegex(search), 'i');
            const matches = await User.find({ $or: [{ name: rx }, { username: rx }] }).select('_id').limit(500).lean();
            baseFilter.follower = { $in: matches.map(u => u._id) };
        }

        const [followers, total] = await Promise.all([
            Follow.find(baseFilter)
                .populate('follower', 'name username profilePicture followersCount followingCount')
                .skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
            Follow.countDocuments(baseFilter)
        ]);

        return NextResponse.json({
            success: true,
            followers: followers.map(f => f.follower).filter(f => f),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
