import crypto from 'crypto';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VisitorDay from '@/models/VisitorDay';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimit';
import { stateNameOf } from '@/lib/utils/regionNames';

export const VID_COOKIE = 'aj_vid';
const VID_RX = /^[a-f0-9]{16,32}$/;
const BOT_RX = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|monitor|python-requests|curl\/|wget|axios|node-fetch|go-http/i;
const AUTH_PATH_RX = /^\/(login|register)(\/|$)/;

export const PROMPT_NAMES = ['exit', 'welcome', 'nudge', 'sticky', 'onetap', 'email', 'sample'];

export const isBotUa = (ua) => !ua || BOT_RX.test(ua);

export const SEGMENTS = ['total', 'real', 'india', 'outside', 'bots'];

// VisitorDay filter for an admin Traffic tab. A suspected bot = single page, direct, from outside India.
export const segmentFilter = (segment) => {
    const suspect = { pages: { $lte: 1 }, source: 'Direct', country: { $nin: ['IN', ''] } };
    const notSuspect = { $nor: [suspect] };
    if (segment === 'bots') return suspect;
    if (segment === 'real') return notSuspect;
    if (segment === 'india') return { $and: [notSuspect, { country: 'IN' }] };
    if (segment === 'outside') return { $and: [notSuspect, { country: { $ne: 'IN' } }] };
    return {};
};

// IST calendar day, 'YYYY-MM-DD'
export const istDay = (d = new Date()) => new Date(d.getTime() + 330 * 60000).toISOString().slice(0, 10);

const readVid = (req) => {
    const m = (req.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${VID_COOKIE}=([^;]+)`));
    return m && VID_RX.test(m[1]) ? m[1] : null;
};

// aj_cta cookie = "<cta name>|<page path>"; no cookie means the visitor reached /login or /register on their own.
const readCta = (req) => {
    const m = (req.headers.get('cookie') || '').match(/(?:^|;\s*)aj_cta=([^;]+)/);
    let name = 'auth_page';
    let path = '';
    if (m) {
        try {
            const [n, p] = decodeURIComponent(m[1]).split('|');
            if (/^[a-z0-9_]{1,40}$/.test(n || '')) { name = n; path = String(p || '').slice(0, 100); }
        } catch (e) { /* keep defaults */ }
    }
    return { name, path };
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

// Traffic sources: Direct | Google Search | Yahoo Search | Bing Search | ChatGPT | Gemini | Grok | DeepSeek | Claude | Other
export const SOURCES = ['Direct', 'Google Search', 'Yahoo Search', 'Bing Search', 'ChatGPT', 'Gemini', 'Grok', 'DeepSeek', 'Claude', 'Other'];

// AI assistants often tag outgoing links with ?utm_source=<name>, which survives even when the referrer is stripped.
const AI_HOSTS = [
    ['ChatGPT', /(^|\.)(chatgpt\.com|openai\.com)$/],
    ['Gemini', /^(gemini|bard)\.google\.com$/],
    ['Grok', /(^|\.)(grok\.com|x\.ai)$/],
    ['DeepSeek', /(^|\.)deepseek\.com$/],
    ['Claude', /(^|\.)(claude\.ai|anthropic\.com)$/],
];
const AI_UTM = [
    ['ChatGPT', /chatgpt|openai/i], ['Gemini', /gemini|bard/i], ['Grok', /grok/i], ['DeepSeek', /deepseek/i], ['Claude', /claude|anthropic/i],
];

export const sourceOf = (ref, ownHost, utm = '') => {
    const u = String(utm || '');
    const fromUtm = u && AI_UTM.find(([, rx]) => rx.test(u));
    if (fromUtm) return fromUtm[0];

    if (!ref) return 'Direct';
    // Android Google app / quick search box
    if (/^android-app:\/\/com\.google\.android\.googlequicksearchbox/.test(ref)) return 'Google Search';
    let host = '';
    try { host = new URL(ref).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) { return 'Direct'; }
    if (!host || host === ownHost) return 'Direct';

    const ai = AI_HOSTS.find(([, rx]) => rx.test(host));
    if (ai) return ai[0];
    if (/^google\.[a-z.]+$/.test(host)) return 'Google Search';
    if (/(^|\.)yahoo\./.test(host)) return 'Yahoo Search';
    if (/(^|\.)bing\.com$/.test(host)) return 'Bing Search';
    return 'Other';
};

// Rows stored before this list existed used the older names; fold them into the current ones for display.
export const LEGACY_SOURCE = { Google: 'Google Search', Search: 'Other', Social: 'Other', WhatsApp: 'Other', Telegram: 'Other', Referral: 'Other' };

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

        // Signup-prompt events: { vid, evt: 'shown' | 'click', name }
        if (b.evt) {
            if (!vid || !['shown', 'click'].includes(b.evt) || !PROMPT_NAMES.includes(b.name)) return ok();
            await dbConnect();
            await VisitorDay.updateOne(
                { day: istDay(), vid },
                { $addToSet: { [b.evt === 'click' ? 'clicks' : 'prompts']: b.name }, $set: { lastAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
                { upsert: true }
            );
            return ok();
        }

        const path = typeof b.path === 'string' ? b.path.split('?')[0].split('#')[0].slice(0, 200) : '';
        if (!vid || !path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return ok();

        const ownHost = (req.headers.get('host') || '').replace(/^www\./, '').toLowerCase();
        const ref = typeof b.ref === 'string' ? b.ref.slice(0, 300) : '';
        const utm = typeof b.utm === 'string' ? b.utm.slice(0, 40) : '';

        await dbConnect();
        await VisitorDay.updateOne(
            { day: istDay(), vid },
            {
                $inc: { pages: 1 },
                $set: { lastAt: new Date(), lastPath: path, ...(AUTH_PATH_RX.test(path) ? { sawAuth: true } : {}) },
                $setOnInsert: {
                    firstPath: path,
                    source: sourceOf(ref, ownHost, utm),
                    device: deviceOf(ua),
                    ...parseUa(ua),
                    country: (req.headers.get('x-vercel-ip-country') || '').slice(0, 2).toUpperCase(),
                    region: safeDecode(req.headers.get('x-vercel-ip-country-region')).slice(0, 40),
                    state: stateNameOf(req.headers.get('x-vercel-ip-country'), safeDecode(req.headers.get('x-vercel-ip-country-region'))).slice(0, 60),
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
export async function trackAuth(req, kind, method, userId) {
    try {
        const vid = readVid(req);
        const cta = kind === 'signup' ? readCta(req) : null;
        if (!vid || !['signup', 'login'].includes(kind) || !['google', 'password'].includes(method)) return;
        await dbConnect();
        await VisitorDay.updateOne(
            { day: istDay(), vid },
            { $set: { [kind]: method, ...(userId ? { [`${kind}Uid`]: String(userId) } : {}), lastAt: new Date(), ...(cta ? { signupFrom: cta.name, signupPath: cta.path } : {}) }, $setOnInsert: { createdAt: new Date() } },
            { upsert: true }
        );
    } catch (e) { /* ignore */ }
}
