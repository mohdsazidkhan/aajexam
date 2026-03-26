import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
import User from '@/models/User';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { txnid } = await params;

        if (!txnid) {
            return NextResponse.json({ success: false, message: 'Transaction ID is required' }, { status: 400 });
        }

        const paymentOrder = await PaymentOrder.findOne({ payuTransactionId: txnid });

        if (!paymentOrder) {
            return NextResponse.json({ success: false, message: 'Payment order not found' }, { status: 404 });
        }

        const user = await User.findById(paymentOrder.user);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const plans = {
            pro: { amount: Number(process.env.PRO_PLAN_PRICE || 99), duration: 30, name: 'Pro Plan (Monthly)' }
        };

        const plan = plans[paymentOrder.planId];
        if (!plan) {
            return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });
        }

        const paymentData = {
            txnid: paymentOrder.payuTransactionId,
            status: paymentOrder.payuStatus || 'pending',
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            receipt: paymentOrder.receipt,
            planId: paymentOrder.planId,
            planName: plan.name,
            planPrice: plan.amount,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone
            },
            createdAt: paymentOrder.createdAt,
            updatedAt: paymentOrder.updatedAt
        };

        return NextResponse.json({
            success: true,
            data: paymentData
        });
    } catch (error) {
        console.error('Error fetching payment data:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error while fetching payment data',
            error: error.message
        }, { status: 500 });
    }
}
