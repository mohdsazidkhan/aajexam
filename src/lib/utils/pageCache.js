// CDN caching for server-rendered public pages.
//
// A getServerSideProps page that sends no Cache-Control header runs a serverless function (and its DB queries) on
// EVERY request, crawlers included. These pages read only the URL (params/query), never cookies or headers, so the
// response is the same for everyone and the CDN can keep it. Student-area pages re-export these same functions.
//
// Only successful results are cached: errors (`initialError`) get no header, so a failed render is retried.
//
// `shared` (optional) adds a second layer for pages whose compute is a heavy aggregate: the successful result is also
// kept in the shared two-level cache (memory + Mongo, see sharedCache.js), so a CDN miss in another region or on another
// instance does not repeat the aggregate. { key: (context) => string, ttl: seconds }.
import dbConnect from '@/lib/db';
import { readCache, writeCache } from '@/lib/utils/sharedCache';

const header = (sMaxAge, swr) => `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`;
const isGood = (r) => !!r && (r.redirect || r.notFound || (r.props && !r.props.initialError));

export function withPageCache(getServerSidePropsImpl, { sMaxAge = 3600, swr = 86400, shared } = {}) {
    return async function getServerSideProps(context) {
        let result;
        let key = null;
        if (shared) {
            try {
                key = shared.key(context);
                if (key) await dbConnect();
                const hit = key ? await readCache(key) : null;
                if (hit) result = hit;
            } catch { /* cache problems fall through to computing */ }
        }
        if (!result) {
            result = await getServerSidePropsImpl(context);
            if (key && result && result.props && !result.props.initialError) {
                try { await writeCache(key, JSON.parse(JSON.stringify(result)), shared.ttl || 600); } catch { /* best-effort */ }
            }
        }

        const res = context && context.res;
        if (!res || !result || res.headersSent) return result;
        if (result.redirect) {
            // Canonical-slug redirects almost never change.
            res.setHeader('Cache-Control', header(86400, 604800));
        } else if (result.notFound) {
            // Short, so a page that gets created later shows up soon, but a crawler hammering dead URLs is absorbed.
            res.setHeader('Cache-Control', header(300, 3600));
        } else if (isGood(result)) {
            res.setHeader('Cache-Control', header(sMaxAge, swr));
        }
        return result;
    };
}
