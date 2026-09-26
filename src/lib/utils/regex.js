// Escapes regex metacharacters in user-supplied search input before it's used
// to build a `new RegExp(...)` / `$regex` filter — without this, a query like
// "a(" throws (invalid regex) and a crafted pathological pattern can trigger
// catastrophic backtracking (ReDoS) against every field it's matched on.
export const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
