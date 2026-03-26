import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
import { getPayuConfig, payuHelpers } from '@/lib/payu';
import { activateSubscription } from '@/lib/subscription';

export async function POST(req) {
    try {
        await dbConnect();
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());

        const payuConfig = getPayuConfig();
        const isValid = payuHelpers.validateResponse(data, {
            merchantKey: payuConfig.merchantKey,
            merchantSalt: payuConfig.merchantSalt
        });

        // In production, redirects to frontend app
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                            process.env.NEXT_PUBLIC_SITE_URL || 
                            (process.env.NODE_ENV === 'production' ? 'https://aajexam.com' : 'http://localhost:3000');

        if (!isValid) {
            console.error('Invalid PayU Success Hash for txn:', data.txnid);
            return NextResponse.redirect(`${frontendUrl}/subscription/payu-failure?txnid=${data.txnid}&reason=invalid_hash`, 303);
        }

        const paymentOrder = await PaymentOrder.findOne({ payuTransactionId: data.txnid });

        if (paymentOrder && paymentOrder.status !== 'paid') {
            paymentOrder.status = 'paid';
            paymentOrder.payuStatus = data.status;
            paymentOrder.payuResponse = data;
            paymentOrder.payuPaymentId = data.mihpayid;
            await paymentOrder.save();

            // Activate subscription automatically
            await activateSubscription({
                userId: data.udf1,
                planId: data.udf2,
                amount: data.amount,
                txnid: data.txnid,
                paymentOrder
            });
        }

        // Redirect browser to success page
        return NextResponse.redirect(`${frontendUrl}/subscription/payu-success?txnid=${data.txnid}`, 303);
    } catch (error) {
        console.error('Success callback error:', error);
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                            process.env.NEXT_PUBLIC_SITE_URL || 
                            (process.env.NODE_ENV === 'production' ? 'https://aajexam.com' : 'http://localhost:3000');
        return NextResponse.redirect(`${frontendUrl}/subscription/payu-failure`, 303);
    }
}

export async function GET(req) {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                        process.env.NEXT_PUBLIC_SITE_URL || 
                        (process.env.NODE_ENV === 'production' ? 'https://aajexam.com' : 'http://localhost:3000');
    return NextResponse.redirect(`${frontendUrl}/subscription/payu-success`, 303);
}

