import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorProfile from '@/models/MentorProfile';
import { protect, admin } from '@/middleware/auth';

// GET - Admin list all mentor applications
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        let query = {};
        if (status) query.status = status;

        const [mentors, total] = await Promise.all([
            MentorProfile.find(query)
                .populate('user', 'name email username')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            MentorProfile.countDocuments(query)
        ]);

        return NextResponse.json({ success: true, data: mentors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
