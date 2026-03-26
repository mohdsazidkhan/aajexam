import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { savePrevMonthPlayedUsers } from '@/lib/cron-tasks';
import { protect, admin } from '@/middleware/auth';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const result = await savePrevMonthPlayedUsers(true);

        return NextResponse.json({ success: true, message: 'User snapshot saved', result });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
