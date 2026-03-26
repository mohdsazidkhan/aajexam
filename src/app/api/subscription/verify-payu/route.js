import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
import { getPayuConfig, payuHelpers } from '@/lib/payu';
import { protect } from '@/middleware/auth';
import { activateSubscription } from '@/lib/subscription';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const data = await req.json();
        const { txnid, status, amount, hash, udf1, udf2 } = data;

        if (!txnid || !status || !amount || !hash) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const payuConfig = getPayuConfig();
        const isValid = payuHelpers.validateResponse(data, {
            merchantKey: payuConfig.merchantKey,
            merchantSalt: payuConfig.merchantSalt
        });

        if (!isValid) return NextResponse.json({ success: false, message: "Invalid hash" }, { status: 400 });

        const paymentOrder = await PaymentOrder.findOne({ payuTransactionId: txnid });
        if (!paymentOrder) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });

        if (paymentOrder.status !== 'paid') {
            paymentOrder.status = status === 'success' ? 'paid' : 'failed';
            paymentOrder.payuStatus = status;
            paymentOrder.payuResponse = data;
            if (status === 'success') paymentOrder.payuPaymentId = data.mihpayid || txnid;
            await paymentOrder.save();

            if (status === 'success') {
                const subscription = await activateSubscription({
                    userId: udf1,
                    planId: udf2,
                    amount: paymentOrder.amount,
                    txnid,
                    paymentOrder
                });
                return NextResponse.json({ success: true, message: "Activated successfully", subscription });
            }
        } else if (status === 'success') {
            return NextResponse.json({ success: true, message: "Already activated" });
        }

        return NextResponse.json({ success: false, message: "Payment failed", status });

    } catch (error) {
        console.error('Verify PayU error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
