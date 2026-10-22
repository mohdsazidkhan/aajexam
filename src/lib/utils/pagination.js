// Shared paging/search helpers for list APIs.
//
// Backward-compatible by design: the released RN app calls many list endpoints
// with no page/limit and expects the whole list in the old response shape. So
// when the client sends neither `page` nor `limit` we run in "legacy" mode
// (same shape, but capped at `legacyCap` so a list can never grow unbounded).
// When either is sent, we paginate and the route adds a `pagination` block.

export const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toInt = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
};

export function parsePaging(searchParams, { defaultLimit = 20, maxLimit = 100, legacyCap = 1000 } = {}) {
    const rawPage = toInt(searchParams.get('page'));
    const rawLimit = toInt(searchParams.get('limit'));
    const paged = rawPage !== null || rawLimit !== null;

    const limit = paged ? Math.min(rawLimit || defaultLimit, maxLimit) : legacyCap;
    const page = paged ? (rawPage || 1) : 1;
    const search = (searchParams.get('search') || searchParams.get('q') || '').trim().slice(0, 100);

    return { paged, page, limit, skip: (page - 1) * limit, search };
}

export function pagingMeta({ page, limit }, total) {
    return {
        page,
        currentPage: page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasMore: page * limit < total,
    };
}
