import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        if (!query || query.length < 2) return NextResponse.json({ message: 'Query too short' }, { status: 400 });

        const searchRegex = new RegExp(query.trim(), 'i');
        const users = await User.find({ $or: [{ username: searchRegex }, { name: searchRegex }], status: 'active' })
            .select('name username profilePicture followersCount followingCount bio')
            .skip(skip).limit(limit).sort({ followersCount: -1 });

        const total = await User.countDocuments({ $or: [{ username: searchRegex }, { name: searchRegex }], status: 'active' });

        return NextResponse.json({
            success: true,
            users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
