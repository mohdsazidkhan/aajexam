import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';
import { parsePaging, pagingMeta } from '@/lib/utils/pagination';
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

        const paging = parsePaging(searchParams, { defaultLimit: 20, maxLimit: 100, legacyCap: 500 });
        const [admins, total] = await Promise.all([
            User.find(query)
                .select('name email phone username createdAt')
                .sort({ createdAt: 1 })
                .skip(paging.skip)
                .limit(paging.limit)
                .lean(),
            paging.paged ? User.countDocuments(query) : Promise.resolve(0),
        ]);

        return NextResponse.json({ success: true, admins, ...(paging.paged ? { pagination: pagingMeta(paging, total) } : {}) });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
