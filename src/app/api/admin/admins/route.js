import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';
import { escapeRegex } from '@/lib/utils/regex';

// GET - List all admin accounts
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        const query = { role: 'admin' };
        if (search && search.trim()) {
            const regex = new RegExp(escapeRegex(search.trim()), 'i');
            query.$or = [{ name: regex }, { email: regex }];
        }

        const admins = await User.find(query)
            .select('name email phone username createdAt')
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({ success: true, admins });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
