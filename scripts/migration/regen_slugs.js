// Regenerates Subject (global unique) and Topic (unique per subject) slugs from current names, same rules as src/lib/utils/slug.js.
// Changed slug -> old slug pushed to previousSlugs (301 redirect source), new slug removed from previousSlugs.
// Names that slugify to the "item" fallback (e.g. Devanagari-only) keep their current slug.
// Dry-run unless --go. Backup JSON of every changed doc's {_id, slug, previousSlugs} written first.
const fs = require('fs');
const path = require('path');
const m = require('mongoose');
const env = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const GO = process.argv.includes('--go');
const MAX_LEN = 120;
// keep identical to src/lib/utils/slug.js
const slugify = (input) => {
    const raw = String(input || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
    const cleaned = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!cleaned) return 'item';
    if (cleaned.length <= MAX_LEN) return cleaned;
    const t = cleaned.slice(0, MAX_LEN); const h = t.lastIndexOf('-');
    return (h > 60 ? t.slice(0, h) : t).replace(/-+$/, '');
};

function plan(docs, scopeKey) {
    // taken[scope] = Map(slug -> id)
    const taken = new Map();
    const key = d => scopeKey(d);
    for (const d of docs) { const k = key(d); if (!taken.has(k)) taken.set(k, new Map()); if (d.slug) taken.get(k).set(d.slug, String(d._id)); }
    const changes = [];
    const sorted = [...docs].sort((a, b) => a._id.getTimestamp() - b._id.getTimestamp());
    for (const d of sorted) {
        const base = slugify(d.name);
        if (base === 'item' || d.slug === base) continue;
        const t = taken.get(key(d));
        let cand = base, n = 1;
        while (t.has(cand) && t.get(cand) !== String(d._id)) { n++; cand = `${base.slice(0, MAX_LEN - String(n).length - 1).replace(/-+$/, '')}-${n}`; }
        if (cand === d.slug) continue;
        if (d.slug) t.delete(d.slug);
        t.set(cand, String(d._id));
        changes.push({ doc: d, from: d.slug, to: cand });
    }
    return changes;
}

(async () => {
    await m.connect(uri);
    const db = m.connection.db;
    const subjects = await db.collection('subjects').find({}).toArray();
    const topics = await db.collection('topics').find({}).toArray();
    // only live docs: inactive ones (merged shells, practice_embedded '-pyq-mock' holders) are never publicly routed
    const sc = plan(subjects.filter(d => d.isActive !== false), () => 'g');
    const tc = plan(topics.filter(d => d.isActive !== false), d => String(d.subject));
    console.log('subjects', subjects.length, 'to change', sc.length, '| topics', topics.length, 'to change', tc.length);
    console.log('active subjects changing', sc.filter(c => c.doc.isActive !== false).length, '| active topics changing', tc.filter(c => c.doc.isActive !== false).length);
    sc.slice(0, 15).forEach(c => console.log(' S', c.doc.name, ':', c.from, '->', c.to));
    tc.slice(0, 25).forEach(c => console.log(' T', c.doc.name, ':', c.from, '->', c.to));
    if (!GO) { console.log('DRY RUN'); return m.disconnect(); }
    const bak = path.join(__dirname, `regen_slugs_backup_${Date.now()}.json`);
    fs.writeFileSync(bak, JSON.stringify({ subjects: sc.map(c => ({ _id: c.doc._id, slug: c.doc.slug, previousSlugs: c.doc.previousSlugs || [] })), topics: tc.map(c => ({ _id: c.doc._id, slug: c.doc.slug, previousSlugs: c.doc.previousSlugs || [] })) }));
    console.log('backup ->', bak);
    const apply = async (col, changes) => {
        for (const c of changes) {
            const prev = new Set(c.doc.previousSlugs || []);
            if (c.from) prev.add(c.from);
            prev.delete(c.to);
            await db.collection(col).updateOne({ _id: c.doc._id }, { $set: { slug: c.to, previousSlugs: [...prev], updatedAt: new Date() } });
        }
    };
    // two-step to dodge transient unique collisions: clear slugs of changers first
    for (const [col, ch] of [['subjects', sc], ['topics', tc]]) {
        await db.collection(col).updateMany({ _id: { $in: ch.map(c => c.doc._id) } }, { $unset: { slug: '' } });
        await apply(col, ch);
    }
    console.log('done. subjects', sc.length, 'topics', tc.length);
    await m.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
