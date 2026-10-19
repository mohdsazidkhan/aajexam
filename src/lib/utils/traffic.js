import crypto from 'crypto';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VisitorDay from '@/models/VisitorDay';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimit';

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

// Small user-agent parser: OS, browser (major version) and Android device model.
const parseUa = (ua) => {
    let os = ''; let osVersion = ''; let m;
    if ((m = ua.match(/Android ([\d.]+)/))) { os = 'Android'; osVersion = m[1]; }
    else if ((m = ua.match(/(?:iPhone|CPU) OS ([\d_]+)/)) && /iPhone|iPad|iPod/.test(ua)) { os = 'iOS'; osVersion = m[1].replace(/_/g, '.'); }
    else if (/Windows NT/.test(ua)) { os = 'Windows'; osVersion = (ua.match(/Windows NT ([\d.]+)/) || [])[1] === '10.0' ? '10/11' : (ua.match(/Windows NT ([\d.]+)/) || [])[1] || ''; }
    else if (/Mac OS X/.test(ua)) { os = 'macOS'; }
    else if (/CrOS/.test(ua)) { os = 'ChromeOS'; }
    else if (/Linux/.test(ua)) { os = 'Linux'; }

    let browser = ''; let browserVersion = '';
    const pick = (rx, name) => { const r = ua.match(rx); if (r) { browser = name; browserVersion = r[1].split('.')[0]; return true; } return false; };
    pick(/Edg(?:e|A|iOS)?\/([\d.]+)/, 'Edge') || pick(/OPR\/([\d.]+)/, 'Opera') || pick(/SamsungBrowser\/([\d.]+)/, 'Samsung Internet')
        || pick(/(?:Firefox|FxiOS)\/([\d.]+)/, 'Firefox') || pick(/(?:Chrome|CriOS)\/([\d.]+)/, 'Chrome') || pick(/Version\/([\d.]+).*Safari/, 'Safari');

    const model = ((ua.match(/Android [\d.]+; ([^;)]+)/) || [])[1] || '').trim();
    return { os, osVersion, browser, browserVersion, deviceModel: model === 'K' ? '' : model.slice(0, 40) };
};

const hashIp = (ip) => (ip
    ? crypto.createHash('sha256').update(`${process.env.JWT_SECRET || 'aajexam'}|${ip}`).digest('hex').slice(0, 16)
    : '');

const safeDecode = (v) => { try { return decodeURIComponent(v || ''); } catch (e) { return v || ''; } };

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
                    ...parseUa(ua),
                    country: (req.headers.get('x-vercel-ip-country') || '').slice(0, 2).toUpperCase(),
                    region: safeDecode(req.headers.get('x-vercel-ip-country-region')).slice(0, 40),
                    city: safeDecode(req.headers.get('x-vercel-ip-city')).slice(0, 60),
                    ipHash: hashIp(getClientIp(req)),
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
