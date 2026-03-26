import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { runDailyReset } from '@/lib/cron-tasks';

export async function GET(req) {
    try {
        const authHeader = req.headers.get('authorization');
        if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const result = await runDailyReset();
        return NextResponse.json({ success: true, message: 'Daily reset completed', result });
    } catch (error) {
        console.error('[Cron] Daily reset failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
