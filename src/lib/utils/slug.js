// Shared slug helpers used by Mongoose pre-save hooks and the backfill script.
// Slug rules (kept consistent across all models):
//  - lowercase ASCII a–z, 0–9 and "-"
//  - collapse non-alphanumeric runs into a single hyphen
//  - trim leading/trailing hyphens
//  - max 120 chars (truncated on a hyphen boundary when possible)
//  - never empty (falls back to "item")
//
// Uniqueness: ensureUniqueSlug() probes the model for collisions and appends
// "-2", "-3", … until a free slug is found. The collection MUST have a unique
// index on `slug` so a race-conditioned write fails loudly rather than producing
// silent duplicates.

const MAX_LEN = 120;

export const slugify = (input) => {
    const raw = String(input || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
    const cleaned = raw
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    if (!cleaned) return 'item';
    if (cleaned.length <= MAX_LEN) return cleaned;
    const truncated = cleaned.slice(0, MAX_LEN);
    const lastHyphen = truncated.lastIndexOf('-');
    return (lastHyphen > 60 ? truncated.slice(0, lastHyphen) : truncated).replace(/-+$/, '');
};

// Pad a date into "yyyy-mm-dd" – used for current-affairs slugs.
export const dateSegment = (d) => {
    const date = d ? new Date(d) : new Date();
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};

// Probe the given Mongoose model for slug collisions and return a unique slug.
// Skips the document with `excludeId` (for updates that don't change the title).
export const ensureUniqueSlug = async (Model, baseSlug, { excludeId } = {}) => {
    const base = slugify(baseSlug);
    let candidate = base;
    let suffix = 1;

    while (true) {
        const filter = { slug: candidate };
        if (excludeId) filter._id = { $ne: excludeId };
        const existing = await Model.exists(filter);
        if (!existing) return candidate;
        suffix += 1;
        const tail = `-${suffix}`;
        const trimmedBase = base.length + tail.length > MAX_LEN
            ? base.slice(0, MAX_LEN - tail.length).replace(/-+$/, '')
            : base;
        candidate = `${trimmedBase}${tail}`;
    }
};

// Mongoose pre-save hook factory. Auto-generates slug from `sourceField` if the
// document has no slug or if the source field changed and slug wasn't manually
// edited. `composer` lets callers blend extra context (e.g. date for current
// affairs, year for PYQs) into the slug.
export const attachSlugHook = (schema, { sourceField, composer } = {}) => {
    schema.pre('save', async function slugHook(next) {
        try {
            const Model = this.constructor;
            const sourceValue = composer ? composer(this) : this[sourceField];
            const sourceChanged = composer
                ? true // composer-driven slugs depend on multiple fields; recompute when slug is missing
                : this.isModified(sourceField);

            if (!this.slug || (sourceChanged && !this.isModified('slug'))) {
                if (!sourceValue) return next();
                this.slug = await ensureUniqueSlug(Model, sourceValue, { excludeId: this._id });
            }
            next();
        } catch (err) {
            next(err);
        }
    });
};
