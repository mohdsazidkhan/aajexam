import { NextResponse } from 'next/server';
import { protect } from '@/middleware/auth';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Quiz reward claiming has been removed.
        // Rewards are now handled directly through wallet transactions.
        return NextResponse.json({
            success: false,
            message: 'Reward claiming via this endpoint is no longer available. Rewards are credited directly to your wallet.'
        }, { status: 400 });
    } catch (error) {
        console.error('Claim Reward Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error',
            error: error.message
        }, { status: 500 });
    }
}
