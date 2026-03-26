import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';

export async function POST(req) {
    try {
        await dbConnect();
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());

        const paymentOrder = await PaymentOrder.findOne({ payuTransactionId: data.txnid });
        if (paymentOrder) {
            paymentOrder.status = 'failed';
            paymentOrder.payuStatus = data.status || 'failed';
            paymentOrder.payuResponse = data;
            await paymentOrder.save();
        }

        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                            process.env.NEXT_PUBLIC_SITE_URL || 
                            (process.env.NODE_ENV === 'production' ? 'https://aajexam.com' : 'http://localhost:3000');
        return NextResponse.redirect(`${frontendUrl}/subscription/payu-failure?txnid=${data.txnid}`, 303);
    } catch (error) {
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
    return NextResponse.redirect(`${frontendUrl}/subscription/payu-failure`, 303);
}

