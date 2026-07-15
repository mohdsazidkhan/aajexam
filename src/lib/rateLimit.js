import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RateLimit from '@/models/RateLimit';

/**
 * Best-effort client IP from the proxy chain. Vercel puts the real client
 * first in x-forwarded-for; we fall back to x-real-ip, then a constant so a
 * missing header can never crash the limiter (it just shares one bucket).
 */
export function getClientIp(req) {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Atomic fixed-window counter backed by a single Mongo document per key.
 * The aggregation-pipeline update increments within a live window or resets
 * to 1 once the window has lapsed — one round-trip, race-safe per document.
 *
 * @returns {Promise<{ ok: boolean, remaining: number, retryAfter: number, limit: number }>}
 */
export async function rateLimit({ key, limit = 10, windowSec = 60 }) {
    try {
        await dbConnect();
        const now = Date.now();
        const windowMs = windowSec * 1000;

        const run = () => RateLimit.findOneAndUpdate(
            { key },
            [
                {
                    $set: {
                        count: {
                            $cond: [
                                { $gt: ['$expiresAt', new Date(now)] },
                                { $add: [{ $ifNull: ['$count', 0] }, 1] },
                                1,
                            ],
                        },
                        expiresAt: {
                            $cond: [
                                { $gt: ['$expiresAt', new Date(now)] },
                                '$expiresAt',
                                new Date(now + windowMs),
                            ],
                        },
                    },
                },
            ],
            { upsert: true, new: true }
        );

        let doc;
        try {
            doc = await run();
        } catch (e) {
            // Two concurrent upserts on a fresh key can collide on the unique
            // index (E11000). The loser just retries against the now-existing doc.
            if (e && e.code === 11000) doc = await run();
            else throw e;
        }

        const count = doc?.count ?? 1;
        const remaining = Math.max(0, limit - count);
        const retryAfter = Math.max(1, Math.ceil(((doc?.expiresAt?.getTime?.() || now + windowMs) - now) / 1000));
        return { ok: count <= limit, remaining, retryAfter, limit };
    } catch (err) {
        // Fail OPEN: a limiter outage must never take down login/payments.
        console.error('[rateLimit] error, allowing request:', err?.message);
        return { ok: true, remaining: 1, retryAfter: 0, limit };
    }
}

/**
 * Convenience guard for Route Handlers. Returns a ready-to-send 429
 * NextResponse when the caller is over the limit, or null to proceed.
 *
 *   const limited = await enforceRateLimit(req, { name: 'login', limit: 8, windowSec: 300 });
 *   if (limited) return limited;
 *
 * `by` picks the bucket dimension: 'ip' (default) or an explicit id string
 * (e.g. a userId) for per-user limits.
 */
export async function enforceRateLimit(req, { name, limit = 10, windowSec = 60, by } = {}) {
    const dimension = by || getClientIp(req);
    const { ok, retryAfter, limit: max } = await rateLimit({ key: `${name}:${dimension}`, limit, windowSec });
    if (ok) return null;

    return NextResponse.json(
        { success: false, message: 'Too many requests. Please slow down and try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter), 'X-RateLimit-Limit': String(max) } }
    );
}
