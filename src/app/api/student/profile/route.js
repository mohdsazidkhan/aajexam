import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import BankDetail from '@/models/BankDetail';
import Subscription from '@/models/Subscription';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();

        // Try to get user from token first
        const authResult = await protect(req);
        const { searchParams } = new URL(req.url);
        const userIdFromQuery = searchParams.get('userId');
        const competitionType = searchParams.get('type') || 'monthly';
        const date = searchParams.get('date');
        const week = searchParams.get('week');

        let userId;

        if (authResult.authenticated) {
            userId = authResult.user.id;
        } else {
            // Fallback to query parameter (backward compatibility or testing)
            userId = userIdFromQuery;
        }

        if (!userId) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const user = await User.findById(userId).select('-password').populate('currentSubscription');
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Get level information (supports historical data)
        const filterValue = competitionType === 'daily' ? date : (competitionType === 'weekly' ? week : null);
        const levelInfo = await User.getHistoricalLevelInfo(userId, competitionType, filterValue);

        if (!levelInfo && filterValue) {
            return NextResponse.json({ error: `No historical data found for ${competitionType} ${filterValue}` }, { status: 404 });
        }

        // Get profile completion details (same as aajexam-backend)
        const profileCompletion = user.getProfileCompletionDetails();

        // Get bank details for the user (same as aajexam-backend)
        const bankDetail = await BankDetail.findOne({ user: userId });

        const isPro = user.subscriptionStatus === 'pro';
        const walletBalance = user.walletBalance || 0;

        return NextResponse.json({
            success: true,
            user: {
                ...user.toObject(),
                levelInfo,
                profileCompletion,
                bankDetail: bankDetail || null,
                // Add unified wallet fields
                availableBalance: isPro ? walletBalance : 0,
                lockedBalance: !isPro ? walletBalance : 0,
                isPro
            }
        });

    } catch (err) {
        console.error('Profile fetch error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
