import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';
import { protect, admin } from '@/middleware/auth';
import { sanitizeCouponInput } from '../sanitize';

const guard = async (req) => {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    return null;
};

// PUT - update a coupon (the code itself is immutable: past orders reference it)
export async function PUT(req, { params }) {
    try {
        const denied = await guard(req);
        if (denied) return denied;
        await dbConnect();

        const { id } = await params;
        const { data, message } = sanitizeCouponInput(await req.json());
        if (message) return NextResponse.json({ success: false, message }, { status: 400 });

        const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
        if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: coupon });
    } catch (e) {
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}

// DELETE - remove a coupon. Orders keep their stored couponCode for history.
export async function DELETE(req, { params }) {
    try {
        const denied = await guard(req);
        if (denied) return denied;
        await dbConnect();

        const { id } = await params;
        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
