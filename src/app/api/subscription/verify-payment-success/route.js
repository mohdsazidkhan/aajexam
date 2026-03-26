import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
import { protect } from '@/middleware/auth';
import { activateSubscription } from '@/lib/subscription';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const data = await req.json();
        const { txnid, status, amount, udf1, udf2 } = data;

        if (!txnid) {
            return NextResponse.json({ success: false, message: "Missing transaction ID" }, { status: 400 });
        }

        const paymentOrder = await PaymentOrder.findOne({ payuTransactionId: txnid });
        if (!paymentOrder) {
            // If order doesn't exist, we might want to log it or handle it based on business rules
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        if (paymentOrder.status !== 'paid') {
            paymentOrder.status = 'paid';
            paymentOrder.payuStatus = status || 'success';
            paymentOrder.payuResponse = data;
            await paymentOrder.save();

            const subscription = await activateSubscription({
                userId: udf1 || paymentOrder.userId,
                planId: udf2 || paymentOrder.planId,
                amount: paymentOrder.amount,
                txnid,
                paymentOrder
            });

            return NextResponse.json({ success: true, message: "Payment verified and subscription activated", subscription });
        }

        return NextResponse.json({ success: true, message: "Payment already verified" });

    } catch (error) {
        console.error('Verify payment success error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
