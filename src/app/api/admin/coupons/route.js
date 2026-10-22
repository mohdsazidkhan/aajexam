import { NextResponse } from 'next/server';
import { parsePaging, pagingMeta, escapeRegex } from '@/lib/utils/pagination';
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';
import { protect, admin } from '@/middleware/auth';
import { normalizeCouponCode } from '@/lib/coupons';
import { sanitizeCouponInput } from './sanitize';

const guard = async (req) => {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) return { error: NextResponse.json({ message: 'Admin access required' }, { status: 403 }) };
    return { auth };
};

// GET - list coupons (newest first)
export async function GET(req) {
    try {
        const { error } = await guard(req);
        if (error) return error;
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const paging = parsePaging(searchParams, { defaultLimit: 20, maxLimit: 100, legacyCap: 500 });
        const filter = paging.search ? { code: new RegExp(escapeRegex(paging.search), 'i') } : {};
        const [coupons, total] = await Promise.all([
            Coupon.find(filter).sort({ createdAt: -1 }).skip(paging.skip).limit(paging.limit).lean(),
            paging.paged ? Coupon.countDocuments(filter) : Promise.resolve(0),
        ]);
        return NextResponse.json({ success: true, data: coupons, ...(paging.paged ? { pagination: pagingMeta(paging, total) } : {}) });
    } catch (e) {
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}

// POST - create a coupon
export async function POST(req) {
    try {
        const { auth, error } = await guard(req);
        if (error) return error;
        await dbConnect();

        const body = await req.json();
        const { data, message } = sanitizeCouponInput(body);
        if (message) return NextResponse.json({ success: false, message }, { status: 400 });

        const code = normalizeCouponCode(body.code);
        if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
            return NextResponse.json({ success: false, message: 'Code must be 3-30 letters, numbers, - or _' }, { status: 400 });
        }
        if (await Coupon.exists({ code })) {
            return NextResponse.json({ success: false, message: 'A coupon with this code already exists' }, { status: 409 });
        }

        const coupon = await Coupon.create({ ...data, code, createdBy: auth.user._id || auth.user.id });
        return NextResponse.json({ success: true, data: coupon }, { status: 201 });
    } catch (e) {
        if (e?.code === 11000) {
            return NextResponse.json({ success: false, message: 'A coupon with this code already exists' }, { status: 409 });
        }
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
