import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';

// 31 Dec 2026, 11:59 PM IST - used when no pop-up coupon is scheduled.
const DEFAULT_PROMO_END = new Date('2026-12-31T23:59:59.999+05:30');

// Public: when the "PRO is FREE" promo messaging stops. It ends the moment the earliest
// active pop-up coupon starts, so the coupon takes over exactly where the free promo stops.
export async function GET() {
    try {
        await dbConnect();
        const now = new Date();
        const next = await Coupon.findOne({
            showInModal: true,
            isActive: true,
            expiryDate: { $gt: now },
            startDate: { $ne: null },
        }).sort({ startDate: 1 }).select('startDate').lean();

        const end = next?.startDate ? new Date(next.startDate) : DEFAULT_PROMO_END;
        return NextResponse.json({ success: true, promoEnd: end.toISOString() }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    } catch (error) {
        return NextResponse.json({ success: true, promoEnd: DEFAULT_PROMO_END.toISOString() });
    }
}
