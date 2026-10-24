import ApiCache from '@/models/ApiCache';

// Two-level cache for expensive read endpoints (leaderboards, platform-wide stats):
//   L1 = this server instance's memory, L2 = a Mongo collection shared by every instance.
// Without L2 each serverless instance would recompute the same full-collection aggregate
// after its own cold start. Concurrent misses on one instance share a single computation.
//
// Cache failures never break the endpoint: any L2 error falls through to computing.

const L1 = new Map();
const inflight = new Map();
const L1_MAX = 200;

export async function cached(key, ttlSec, compute) {
    const now = Date.now();
    const hit = L1.get(key);
    if (hit && hit.exp > now) return hit.value;

    if (inflight.has(key)) return inflight.get(key);

    const run = (async () => {
        try {
            try {
                const row = await ApiCache.findOne({ key, expiresAt: { $gt: new Date() } }).select('value expiresAt').lean();
                if (row) {
                    L1.set(key, { value: row.value, exp: Math.min(row.expiresAt.getTime(), Date.now() + ttlSec * 1000) });
                    return row.value;
                }
            } catch { /* fall through to compute */ }

            const value = await compute();

            L1.set(key, { value, exp: Date.now() + ttlSec * 1000 });
            if (L1.size > L1_MAX) L1.delete(L1.keys().next().value);
            try {
                await ApiCache.updateOne(
                    { key },
                    { $set: { value, expiresAt: new Date(Date.now() + ttlSec * 1000) } },
                    { upsert: true }
                );
            } catch { /* cache write is best-effort */ }
            return value;
        } finally {
            inflight.delete(key);
        }
    })();

    inflight.set(key, run);
    return run;
}

// Split read/write forms of `cached` for handlers whose compute step is too entangled to wrap.
export async function readCache(key) {
    const hit = L1.get(key);
    if (hit && hit.exp > Date.now()) return hit.value;
    try {
        const row = await ApiCache.findOne({ key, expiresAt: { $gt: new Date() } }).select('value expiresAt').lean();
        if (row) {
            L1.set(key, { value: row.value, exp: row.expiresAt.getTime() });
            return row.value;
        }
    } catch { /* treat as miss */ }
    return null;
}

export async function writeCache(key, value, ttlSec) {
    L1.set(key, { value, exp: Date.now() + ttlSec * 1000 });
    if (L1.size > L1_MAX) L1.delete(L1.keys().next().value);
    try {
        await ApiCache.updateOne({ key }, { $set: { value, expiresAt: new Date(Date.now() + ttlSec * 1000) } }, { upsert: true });
    } catch { /* best-effort */ }
}

/** Last known value even if it has expired: used to keep serving something when recomputing fails (timeouts, DB blips). */
export async function readStaleCache(key) {
    const hit = L1.get(key);
    if (hit) return hit.value;
    try {
        const row = await ApiCache.findOne({ key }).select('value').lean();
        return row ? row.value : null;
    } catch {
        return null;
    }
}
