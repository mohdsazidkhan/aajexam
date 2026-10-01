import crypto from 'crypto';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ClientError from '@/models/ClientError';
import { protect, admin } from '@/middleware/auth';
import { enforceRateLimit } from '@/lib/rateLimit';

const TYPES = ['api', 'render', 'js', 'promise', 'network', 'other'];
const STATUSES = ['open', 'resolved', 'ignored'];
const ORIGINS = ['backend', 'frontend'];

/**
 * backend  = the server is at fault: HTTP 5xx, timeouts, server unreachable.
 * frontend = the client is at fault: render/JS crashes, unhandled promises, and 4xx
 *            (the client sent a bad request / called a route that does not exist).
 * A client may send its own `origin` to override this.
 */
const classifyOrigin = ({ type, statusCode, isTimeout, explicit }) => {
    if (ORIGINS.includes(explicit)) return explicit;
    if (type === 'api') return statusCode >= 500 || isTimeout ? 'backend' : 'frontend';
    if (type === 'network') return 'backend';
    return 'frontend';
};

const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n) : v == null ? '' : String(v).slice(0, n));

// Never store credentials that might have ended up inside a message / stack / extra.
const redact = (text) => String(text || '')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, 'Bearer [redacted]')
    .replace(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[jwt]')
    .replace(/("?(?:password|token|authorization|secret|otp)"?\s*[:=]\s*)"?[^",\s}&]+/gi, '$1[redacted]');

// /api/quiz/64b0f0c2e1b3a1a2b3c4d5e6/start?x=1 -> /api/quiz/:id/start
const normaliseEndpoint = (e) => clip(e, 300)
    .split('?')[0]
    .replace(/[a-f0-9]{24}/gi, ':id')
    .replace(/\/\d+(?=\/|$)/g, '/:n');

const safeExtra = (extra) => {
    if (!extra || typeof extra !== 'object') return null;
    try {
        const s = redact(JSON.stringify(extra));
        return s.length > 2000 ? { truncated: s.slice(0, 2000) } : JSON.parse(s);
    } catch (e) {
        return null;
    }
};

/**
 * Shared by POST /api/mobile-errors and POST /api/web-errors.
 * Public (the user may be logged out / the error may be the login itself), rate limited,
 * and ALWAYS answers quickly - the reporter must never be able to break the client.
 */
export async function recordClientError(req, source) {
    try {
        const limited = await enforceRateLimit(req, { name: `client-errors-${source}`, limit: 60, windowSec: 3600 });
        if (limited) return limited;

        const raw = await req.text();
        if (raw.length > 30000) return NextResponse.json({ success: false, message: 'Payload too large' }, { status: 413 });
        let b;
        try { b = JSON.parse(raw); } catch (e) { return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 }); }
        if (!b || typeof b !== 'object') return NextResponse.json({ success: false, message: 'Invalid body' }, { status: 400 });

        const message = redact(clip(b.message, 600)) || 'Unknown error';
        const type = TYPES.includes(b.type) ? b.type : 'other';
        const errorName = clip(b.errorName, 80);
        const screen = clip(b.screen, 200);
        const endpoint = normaliseEndpoint(b.endpoint);
        const method = clip(b.method, 10).toUpperCase();
        const statusCode = Number.isFinite(Number(b.statusCode)) && Number(b.statusCode) > 0 ? Number(b.statusCode) : null;

        const origin = classifyOrigin({
            type,
            statusCode,
            isTimeout: b.isTimeout === true || /timeout|timed out|abort/i.test(message),
            explicit: b.origin,
        });

        const fingerprint = crypto
            .createHash('sha1')
            .update([source, type, errorName, message.slice(0, 200), screen, endpoint, method, statusCode || ''].join('|'))
            .digest('hex');

        // Optional identity: only if a valid token was sent.
        let user = null;
        if (req.headers.get('authorization')) {
            const auth = await protect(req).catch(() => null);
            if (auth?.authenticated) user = auth.user;
        }

        const now = new Date();
        const latest = {
            lastSeenAt: now,
            stack: redact(clip(b.stack, 4000)),
            componentStack: redact(clip(b.componentStack, 2000)),
            appVersion: clip(b.appVersion, 40),
            platform: clip(b.platform, 40),
            osVersion: clip(b.osVersion, 40),
            device: clip(b.device, 80),
            userAgent: clip(req.headers.get('user-agent') || b.userAgent, 300),
            extra: safeExtra(b.extra),
            ...(user ? { user: user._id, userName: clip(user.name, 80), userEmail: clip(user.email, 120) } : {}),
        };

        await dbConnect();
        const doc = await ClientError.findOneAndUpdate(
            { source, fingerprint },
            {
                $inc: { count: 1 },
                $set: latest,
                $setOnInsert: { origin, type, message, errorName, screen, endpoint, method, statusCode, firstSeenAt: now, status: 'open' },
            },
            { upsert: true, new: true }
        ).catch(async (e) => {
            // two simultaneous first-reports collide on the unique index; the loser just bumps the winner
            if (e && e.code === 11000) {
                return ClientError.findOneAndUpdate({ source, fingerprint }, { $inc: { count: 1 }, $set: latest }, { new: true });
            }
            throw e;
        });

        // A "resolved" error that is happening again is a regression -> reopen it.
        if (doc && doc.status === 'resolved') {
            await ClientError.updateOne({ _id: doc._id }, { $set: { status: 'open', resolvedAt: null }, $inc: { reopenedCount: 1 } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('client error report failed:', error?.message);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

const deny = () => NextResponse.json({ message: 'Admin access required' }, { status: 403 });

/** GET /api/admin/(mobile|web)-errors */
export async function listClientErrors(req, source) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return deny();
        await dbConnect();

        const sp = new URL(req.url).searchParams;
        const page = Math.max(1, parseInt(sp.get('page')) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit')) || 20));
        const status = sp.get('status');
        const type = sp.get('type');
        const origin = sp.get('origin');
        const platform = sp.get('platform');
        const search = (sp.get('search') || '').trim();
        const sort = sp.get('sort') === 'count' ? { count: -1, lastSeenAt: -1 } : { lastSeenAt: -1 };

        const filter = { source };
        if (STATUSES.includes(status)) filter.status = status;
        if (TYPES.includes(type)) filter.type = type;
        if (ORIGINS.includes(origin)) filter.origin = origin;
        if (platform) filter.platform = platform;
        if (search) {
            const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ message: rx }, { screen: rx }, { endpoint: rx }, { userEmail: rx }, { appVersion: rx }];
        }

        const dayAgo = new Date(Date.now() - 24 * 3600 * 1000);
        const [items, total, byStatus, byOrigin, last24h] = await Promise.all([
            ClientError.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
            ClientError.countDocuments(filter),
            ClientError.aggregate([{ $match: { source } }, { $group: { _id: '$status', n: { $sum: 1 }, occurrences: { $sum: '$count' } } }]),
            ClientError.aggregate([{ $match: { source, status: 'open' } }, { $group: { _id: '$origin', n: { $sum: 1 } } }]),
            ClientError.countDocuments({ source, lastSeenAt: { $gte: dayAgo } }),
        ]);

        const summary = { open: 0, resolved: 0, ignored: 0, totalOccurrences: 0, last24h, openBackend: 0, openFrontend: 0 };
        byOrigin.forEach((r) => { if (r._id === 'backend') summary.openBackend = r.n; else summary.openFrontend += r.n; });
        byStatus.forEach((r) => { summary[r._id] = r.n; summary.totalOccurrences += r.occurrences; });

        return NextResponse.json({
            success: true,
            errors: items,
            summary,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/** PATCH /api/admin/(mobile|web)-errors/[id]  { status?, note? } */
export async function updateClientError(req, source, id) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return deny();
        await dbConnect();
        const body = await req.json();
        const set = {};
        if (body.status !== undefined) {
            if (!STATUSES.includes(body.status)) return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
            set.status = body.status;
            set.resolvedAt = body.status === 'resolved' ? new Date() : null;
        }
        if (body.note !== undefined) set.note = clip(body.note, 1000);
        const doc = await ClientError.findOneAndUpdate({ _id: id, source }, { $set: set }, { new: true }).lean();
        if (!doc) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, error: doc });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/** DELETE /api/admin/(mobile|web)-errors/[id]  (or ?resolved=true on the collection to purge resolved ones) */
export async function deleteClientError(req, source, id) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) return deny();
        await dbConnect();
        if (id) {
            const r = await ClientError.deleteOne({ _id: id, source });
            return NextResponse.json({ success: true, deleted: r.deletedCount });
        }
        const r = await ClientError.deleteMany({ source, status: 'resolved' });
        return NextResponse.json({ success: true, deleted: r.deletedCount });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
