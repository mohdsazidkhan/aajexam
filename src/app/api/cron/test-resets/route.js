import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { runCompetitionReset } from '@/lib/cron-tasks';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'daily';

        if (!['daily', 'weekly', 'monthly'].includes(type)) {
            return NextResponse.json({ success: false, message: 'Invalid competition type' }, { status: 400 });
        }

        const authHeader = req.headers.get('authorization');
        // Allow in development without secret, but require in production
        if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Pass true for isDryRun
        const result = await runCompetitionReset(type, true);

        return NextResponse.json({
            success: true,
            message: `Dry-run for ${type} reset completed. No data was modified.`,
            data: result
        });
    } catch (error) {
        console.error('Test reset error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
