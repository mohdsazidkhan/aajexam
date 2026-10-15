import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { protect } from '@/middleware/auth';
import { PRO_PLANS } from '@/lib/plans';
import { validateCoupon } from '@/lib/coupons';

// POST { code } -> price preview of the coupon on every plan, for the checkout UI.
// Nothing is reserved here; create-payu-order re-validates when the order is placed.
// A bad code is a normal outcome, so it answers 200 { success: false } rather than an HTTP error.
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const { code } = await req.json();

        const prices = {};
        let coupon = null;
        let firstError = 'Invalid coupon code';
        for (const plan of PRO_PLANS) {
            const result = await validateCoupon({ code, plan: { id: plan.id, price: plan.price }, userId: auth.user.id });
            if (result.valid) {
                coupon = result.coupon;
                prices[plan.id] = { originalAmount: result.originalAmount, discount: result.discount, finalAmount: result.finalAmount };
            } else if (!coupon) {
                firstError = result.message;
            }
        }

        if (!coupon) return NextResponse.json({ success: false, message: firstError });

        return NextResponse.json({
            success: true,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            prices
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
