import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';

// Display preferences (theme, dark mode, font, text size, language, comfort switches) kept per account so they
// follow the user across devices. The client validates against its own registries; here we only
// bound the shape so nothing odd gets stored.
const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
const FONT_RE = /^[A-Za-z0-9 ]{1,60}$/;
const SIZE_RE = /^[a-z]{1,10}$/;
const LANG_RE = /^[A-Za-z]{2,4}(-[A-Za-z]{2,8})?$/;
const FLAG_KEYS = ['liteMode', 'reduceMotion', 'eyeComfort', 'pureBlack', 'colorBlind'];

function clean(body) {
    const out = {};
    if (typeof body.themeId === 'string' && ID_RE.test(body.themeId)) out.themeId = body.themeId;
    if (typeof body.isDark === 'boolean') out.isDark = body.isDark;
    if (typeof body.followSystem === 'boolean') out.followSystem = body.followSystem;
    if (typeof body.fontFamily === 'string' && FONT_RE.test(body.fontFamily)) out.fontFamily = body.fontFamily;
    if (typeof body.textSizeId === 'string' && SIZE_RE.test(body.textSizeId)) out.textSizeId = body.textSizeId;
    if (typeof body.language === 'string' && LANG_RE.test(body.language)) out.language = body.language;
    for (const key of FLAG_KEYS) {
        if (typeof body[key] === 'boolean') out[key] = body[key];
    }
    return out;
}

// GET - saved display preferences ({} when the user has never synced any)
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
        }
        await dbConnect();
        const user = await User.findById(auth.user.id).select('preferences').lean();
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        const { updatedAt, ...prefs } = user.preferences || {};
        delete prefs._id;
        return NextResponse.json({ success: true, preferences: prefs, updatedAt: updatedAt || null });
    } catch (error) {
        console.error('Get preferences error:', error);
        return NextResponse.json({ success: false, message: 'Failed to load preferences' }, { status: 500 });
    }
}

// PUT - merge the given fields into the saved preferences
export async function PUT(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
        }
        const body = await req.json().catch(() => ({}));
        const fields = clean(body || {});
        if (Object.keys(fields).length === 0) {
            return NextResponse.json({ success: false, message: 'No valid preferences supplied' }, { status: 400 });
        }

        await dbConnect();
        const $set = { 'preferences.updatedAt': new Date() };
        for (const [key, value] of Object.entries(fields)) $set[`preferences.${key}`] = value;

        const result = await User.updateOne({ _id: auth.user.id }, { $set });
        if (!result.matchedCount) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        return NextResponse.json({ success: true, preferences: fields });
    } catch (error) {
        console.error('Update preferences error:', error);
        return NextResponse.json({ success: false, message: 'Failed to save preferences' }, { status: 500 });
    }
}
