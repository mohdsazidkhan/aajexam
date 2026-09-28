import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Announcement from '@/models/Announcement';
import { protect, admin } from '@/middleware/auth';

// GET - paginated list of past announcements, optionally filtered by title/message search or target
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search');
        const target = searchParams.get('target');

        const filter = {};
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [{ title: regex }, { description: regex }];
        }
        if (target && ['all', 'pro', 'free', 'users'].includes(target)) {
            filter.target = target;
        }

        const skip = (page - 1) * limit;
        const [announcements, total] = await Promise.all([
            Announcement.find(filter)
                .populate('sentBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Announcement.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: announcements,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
