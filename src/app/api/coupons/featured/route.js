import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';
import { isCouponLive, publicCoupon, publicUpcomingCoupon } from '@/lib/coupons';

// Public: coupons the admin flagged for the on-site offer modal (only live ones).
export async function GET() {
    try {
        await dbConnect();
        const now = new Date();
        const coupons = await Coupon.find({
            showInModal: true,
            isActive: true,
            expiryDate: { $gt: now },
            $or: [
                { startDate: null },
                { startDate: { $lte: now } },
                // teaser: displayDate reached, coupon itself not started yet
                { displayDate: { $ne: null, $lte: now }, startDate: { $gt: now } }
            ]
        }).sort({ createdAt: -1 }).limit(5).lean();

        const live = coupons.filter((c) => isCouponLive(c, now)).map(publicCoupon);
        const upcoming = coupons
            .filter((c) => c.startDate && c.startDate > now && c.displayDate && c.displayDate <= now)
            .sort((a, b) => a.startDate - b.startDate)
            .map(publicUpcomingCoupon);
        const data = [...live, ...upcoming];
        return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    } catch (error) {
        return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }
}
