import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import User from '@/models/User';
import { enforceRateLimit } from '@/lib/rateLimit';
import { istDay } from '@/lib/utils/traffic';

const EMAIL_RX = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

// Digits only, drops +91 / 91 / a leading 0; must be a 10-digit Indian mobile number (starts with 6-9).
const cleanPhone = (v) => {
    let d = String(v || '').replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : '';
};

// POST /api/leads  { email, phone, source?, path? }
// Public, rate limited. Always answers success for a plausible email, even when it is already a user or
// already saved, so the endpoint cannot be used to find out which emails are registered.
export async function POST(req) {
    try {
        const limited = await enforceRateLimit(req, { name: 'leads', limit: 5, windowSec: 3600 });
        if (limited) return limited;

        const b = await req.json().catch(() => ({}));
        const email = String(b.email || '').trim().toLowerCase();
        if (!EMAIL_RX.test(email) || email.length > 200) {
            return NextResponse.json({ success: false, message: 'Please enter a valid email.' }, { status: 400 });
        }

        const phone = cleanPhone(b.phone);
        if (!phone) {
            return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
        }

        await dbConnect();
        const isUser = await User.exists({ email });
        if (!isUser) {
            await Lead.updateOne(
                { email },
                {
                    $set: { phone },
                    $setOnInsert: {
                        email,
                        source: String(b.source || 'exit').slice(0, 20),
                        path: String(b.path || '').split('?')[0].slice(0, 200),
                        day: istDay(),
                        createdAt: new Date(),
                    },
                },
                { upsert: true }
            );
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('lead error:', error);
        return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
