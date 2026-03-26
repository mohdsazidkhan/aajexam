import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
import { protect } from '@/middleware/auth';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: auth.message }, { status: 401 });

        await dbConnect();
        const data = await req.json();
        const { txnid, status, error_Message } = data;

        if (!txnid) {
            return NextResponse.json({ success: false, message: "Missing transaction ID" }, { status: 400 });
        }

        const paymentOrder = await PaymentOrder.findOne({ payuTransactionId: txnid });
        if (paymentOrder && paymentOrder.status !== 'paid') {
            paymentOrder.status = 'failed';
            paymentOrder.payuStatus = status || 'failure';
            paymentOrder.payuResponse = data;
            paymentOrder.failureReason = error_Message || 'Unknown error';
            await paymentOrder.save();
        }

        return NextResponse.json({ success: true, message: "Payment failure recorded" });

    } catch (error) {
        console.error('Verify payment failure error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
