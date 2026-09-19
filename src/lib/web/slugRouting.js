// Helpers for slug-vs-ObjectId routing in Next.js page-level
// getServerSideProps. Pages keep their existing filenames (e.g. [examId].js)
// and use this to resolve whether the URL segment is a slug or a legacy
// ObjectId — falling back to a 301 redirect to the canonical slug URL.

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

export const isObjectId = (value) => typeof value === 'string' && OBJECT_ID_RE.test(value);

// Build a 301 (`permanent: true`) redirect props object for getServerSideProps.
// Returning permanent so Google transfers ranking from the old ID URL.
export const slugRedirect = (destination) => ({
    redirect: { destination, permanent: true }
});

// A slug that no longer resolves may have been renamed or merged into
// another doc — both cases push the old slug onto the surviving doc's
// `previousSlugs` array (see Subject/Topic model comments). Look it up and
// return a 301 redirect to the doc's current canonical slug, or null when
// there's no such history (a genuine 404).
export async function previousSlugRedirect(Model, segment, canonicalPath) {
    if (!segment) return null;
    const doc = await Model.findOne({ previousSlugs: segment, isActive: { $ne: false } }).select('slug').lean();
    if (!doc?.slug) return null;
    return slugRedirect(canonicalPath(doc.slug));
}

// Convenience: given a Mongoose model + URL segment, return either the doc
// (when it's a slug match) or a redirect target (when it's an ObjectId for
// which the doc has a slug). Returns null when nothing matches.
export async function resolveSlugOrId(Model, segment, { canonicalPath, projection } = {}) {
    if (!segment) return { type: 'notfound' };

    if (isObjectId(segment)) {
        const doc = await Model.findById(segment).select(projection || 'slug').lean();
        if (!doc) return { type: 'notfound' };
        if (doc.slug && canonicalPath) {
            return { type: 'redirect', destination: canonicalPath(doc.slug) };
        }
        return { type: 'doc', doc };
    }

    const doc = await Model.findOne({ slug: segment }).select(projection).lean();
    if (!doc) return { type: 'notfound' };
    return { type: 'doc', doc };
}
