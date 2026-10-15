import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import PaymentOrder from '@/models/PaymentOrder';
import { getPayuConfig, payuHelpers } from '@/lib/payu';
import { protect } from '@/middleware/auth';
import { getPlan } from '@/lib/plans';
import { validateCoupon, normalizeCouponCode } from '@/lib/coupons';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const { planId, couponCode } = await req.json();
        const userId = auth.user.id;

        if (!planId) return NextResponse.json({ success: false, message: "Missing planId" }, { status: 400 });

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        const plan = getPlan(planId);
        if (!plan) return NextResponse.json({ success: false, message: "Invalid plan" }, { status: 400 });

        // Optional coupon: re-validated and re-priced here, never trusted from the client.
        let payable = plan.price;
        let appliedCoupon = null;
        if (normalizeCouponCode(couponCode)) {
            const result = await validateCoupon({ code: couponCode, plan: { id: plan.id, price: plan.price }, userId });
            if (!result.valid) return NextResponse.json({ success: false, message: result.message }, { status: 400 });
            payable = result.finalAmount;
            appliedCoupon = { id: result.coupon._id, code: result.coupon.code, originalAmount: result.originalAmount, discountAmount: result.discount };
        }

        const payuConfig = getPayuConfig();
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const receipt = `sub_${plan.id}_${Date.now()}`;

        const host = req.headers.get('host');
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        // In Next.js, PayU will POST back to these routes
        const surl = `${baseUrl}/api/subscription/payu-success-callback`;
        const furl = `${baseUrl}/api/subscription/payu-failure-callback`;

        const payuParams = {
            key: payuConfig.merchantKey,
            txnid: transactionId,
            amount: payuHelpers.formatAmountForPayU(payable),
            productinfo: `${plan.name} - ${plan.label}`,
            firstname: user.name || 'User',
            email: user.email,
            phone: user.phone || '9999999999',
            surl,
            furl,
            udf1: userId,
            udf2: plan.id,
            udf3: receipt,
            udf4: 'subscription',
            udf5: plan.cycle
        };

        payuParams.hash = payuHelpers.generateRequestHash(payuParams, payuConfig.merchantSalt);

        const paymentOrder = new PaymentOrder({
            orderId: transactionId,
            amount: payable,
            ...(appliedCoupon ? { couponId: appliedCoupon.id, couponCode: appliedCoupon.code, originalAmount: appliedCoupon.originalAmount, discountAmount: appliedCoupon.discountAmount } : {}),
            currency: 'INR',
            receipt,
            user: userId,
            planId: plan.id,
            paymentMethod: 'payu',
            payuTransactionId: transactionId,
            status: 'created'
        });

        await paymentOrder.save();

        return NextResponse.json({
            success: true,
            orderId: transactionId,
            amount: payable,
            paymentUrl: payuConfig.paymentUrl,
            paymentParams: payuParams
        });

    } catch (error) {
        console.error('Create PayU order error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
