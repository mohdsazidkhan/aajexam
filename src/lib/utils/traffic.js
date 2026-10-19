import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VisitorDay from '@/models/VisitorDay';
import { enforceRateLimit } from '@/lib/rateLimit';

export const VID_COOKIE = 'aj_vid';
const VID_RX = /^[a-f0-9]{16,32}$/;
const BOT_RX = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|monitor|python-requests|curl\/|wget|axios|node-fetch|go-http/i;
const AUTH_PATH_RX = /^\/(login|register)(\/|$)/;

// IST calendar day, 'YYYY-MM-DD'
export const istDay = (d = new Date()) => new Date(d.getTime() + 330 * 60000).toISOString().slice(0, 10);

const readVid = (req) => {
    const m = (req.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${VID_COOKIE}=([^;]+)`));
    return m && VID_RX.test(m[1]) ? m[1] : null;
};

const deviceOf = (ua) => (/ipad|tablet/i.test(ua) ? 'tablet' : /mobi|android|iphone/i.test(ua) ? 'mobile' : 'desktop');

const sourceOf = (ref, ownHost) => {
    if (!ref) return 'Direct';
    let host = '';
    try { host = new URL(ref).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) { return 'Direct'; }
    if (!host || host === ownHost) return 'Direct';
    if (/(^|\.)google\./.test(host)) return 'Google';
    if (/bing\.|duckduckgo\.|yahoo\.|yandex\.|ecosia\.|baidu\./.test(host)) return 'Search';
    if (/whatsapp\./.test(host)) return 'WhatsApp';
    if (/(^|\.)t\.me$|telegram\./.test(host)) return 'Telegram';
    if (/facebook\.|fb\.|instagram\.|twitter\.|(^|\.)x\.com$|(^|\.)t\.co$|linkedin\.|youtube\.|(^|\.)youtu\.be$|reddit\./.test(host)) return 'Social';
    return 'Referral';
};

/**
 * POST /api/track  { vid, path, ref, loggedIn }
 * Public, rate limited, best effort: answers 204 no matter what so it can never break the page.
 */
export async function recordPageView(req) {
    const ok = () => new NextResponse(null, { status: 204 });
    try {
        const ua = req.headers.get('user-agent') || '';
        if (!ua || BOT_RX.test(ua)) return ok();

        const limited = await enforceRateLimit(req, { name: 'track', limit: 600, windowSec: 3600 });
        if (limited) return ok();

        const raw = await req.text();
        if (raw.length > 2000) return ok();
        const b = JSON.parse(raw);

        const vid = typeof b.vid === 'string' && VID_RX.test(b.vid) ? b.vid : null;
        const path = typeof b.path === 'string' ? b.path.split('?')[0].split('#')[0].slice(0, 200) : '';
        if (!vid || !path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return ok();

        const ownHost = (req.headers.get('host') || '').replace(/^www\./, '').toLowerCase();
        const ref = typeof b.ref === 'string' ? b.ref.slice(0, 300) : '';

        await dbConnect();
        await VisitorDay.updateOne(
            { day: istDay(), vid },
            {
                $inc: { pages: 1 },
                $set: { lastAt: new Date(), ...(AUTH_PATH_RX.test(path) ? { sawAuth: true } : {}) },
                $setOnInsert: {
                    firstPath: path,
                    source: sourceOf(ref, ownHost),
                    device: deviceOf(ua),
                    wasLoggedIn: b.loggedIn === true,
                    createdAt: new Date(),
                },
            },
            { upsert: true }
        );
    } catch (e) {
        // swallow: analytics must never affect the visitor
    }
    return ok();
}

/**
 * Called from the auth routes. kind: 'signup' | 'login', method: 'google' | 'password'.
 * Awaited by the callers (a serverless function may be frozen right after it responds), but it never
 * throws and silently does nothing for requests without the visitor cookie (e.g. the mobile app).
 */
export async function trackAuth(req, kind, method) {
    try {
        const vid = readVid(req);
        if (!vid || !['signup', 'login'].includes(kind) || !['google', 'password'].includes(method)) return;
        await dbConnect();
        await VisitorDay.updateOne(
            { day: istDay(), vid },
            { $set: { [kind]: method, lastAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
            { upsert: true }
        );
    } catch (e) { /* ignore */ }
}
