import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import PaymentOrder from '@/models/PaymentOrder';
import { getPayuConfig, payuHelpers } from '@/lib/payu';
import { protect } from '@/middleware/auth';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const { planId } = await req.json();
        const userId = auth.user.id;

        if (!planId) return NextResponse.json({ success: false, message: "Missing planId" }, { status: 400 });

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        const plans = {
            basic: { amount: 9, name: 'Basic Plan (Monthly)' },
            premium: { amount: 49, name: 'Premium Plan (Monthly)' },
            pro: { amount: 99, name: 'Pro Plan (Monthly)' }
        };

        const plan = plans[planId];
        if (!plan) return NextResponse.json({ success: false, message: "Invalid plan" }, { status: 400 });

        const payuConfig = getPayuConfig();
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const receipt = `sub_${planId}_${Date.now()}`;

        const host = req.headers.get('host');
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        // In Next.js, PayU will POST back to these routes
        const surl = `${baseUrl}/api/subscription/payu-success-callback`;
        const furl = `${baseUrl}/api/subscription/payu-failure-callback`;

        const payuParams = {
            key: payuConfig.merchantKey,
            txnid: transactionId,
            amount: payuHelpers.formatAmountForPayU(plan.amount),
            productinfo: `${plan.name} - 1 month`,
            firstname: user.name || 'User',
            email: user.email,
            phone: user.phone || '9999999999',
            surl,
            furl,
            udf1: userId,
            udf2: planId,
            udf3: receipt,
            udf4: 'subscription',
            udf5: 'monthly'
        };

        payuParams.hash = payuHelpers.generateRequestHash(payuParams, payuConfig.merchantSalt);

        const paymentOrder = new PaymentOrder({
            orderId: transactionId,
            amount: plan.amount,
            currency: 'INR',
            receipt,
            user: userId,
            planId,
            paymentMethod: 'payu',
            payuTransactionId: transactionId,
            status: 'created'
        });

        await paymentOrder.save();

        return NextResponse.json({
            success: true,
            orderId: transactionId,
            amount: plan.amount,
            paymentUrl: payuConfig.paymentUrl,
            paymentParams: payuParams
        });

    } catch (error) {
        console.error('Create PayU order error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
