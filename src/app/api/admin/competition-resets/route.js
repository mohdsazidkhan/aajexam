import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { protect, admin } from '@/middleware/auth';
import { runCompetitionReset } from '@/lib/cron-tasks';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { type, dryRun } = await req.json();

        if (!['daily', 'weekly', 'monthly'].includes(type)) {
            return NextResponse.json({ message: 'Invalid reset type' }, { status: 400 });
        }

        console.log(`Manual reset triggered by admin: ${type} (dryRun: ${dryRun})`);
        const result = await runCompetitionReset(type, dryRun);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Manual competition reset failed:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Reset failed' 
        }, { status: 500 });
    }
}
