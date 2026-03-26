import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTestAttempt from '@/models/UserTestAttempt';
import User from '@/models/User';
import PracticeTest from '@/models/PracticeTest';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const query = {};
        if (status) query.status = status;
        if (search) query.$or = [{ 'user.name': { $regex: search, $options: 'i' } }, { 'user.email': { $regex: search, $options: 'i' } }];

        const attempts = await UserTestAttempt.find(query).populate('user', 'name email').populate('practiceTest', 'title').sort({ submittedAt: -1 }).skip(skip).limit(limit);
        const total = await UserTestAttempt.countDocuments(query);

        return NextResponse.json({ success: true, data: attempts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
