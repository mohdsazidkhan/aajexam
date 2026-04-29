/**
 * Backfill `slug` for every collection that should be addressable by URL.
 * Reuses the same slugify() rules as the Mongoose pre-save hooks so future
 * writes stay consistent with the historical backfill.
 *
 * Idempotent: existing slugs are kept as-is; only documents with no slug get
 * one. Rerun safely after seeding new content.
 *
 * Run with: node scripts/backfill-slugs.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
}

const MAX_LEN = 120;
const slugify = (input) => {
    const raw = String(input || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
    const cleaned = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!cleaned) return 'item';
    if (cleaned.length <= MAX_LEN) return cleaned;
    const truncated = cleaned.slice(0, MAX_LEN);
    const lastHyphen = truncated.lastIndexOf('-');
    return (lastHyphen > 60 ? truncated.slice(0, lastHyphen) : truncated).replace(/-+$/, '');
};
const dateSegment = (d) => {
    const date = d ? new Date(d) : new Date();
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};

// Per-collection slug source. Keep these in sync with the model `attachSlugHook`
// composers in src/models/*.
const targets = [
    { name: 'exams', collection: 'exams', source: (d) => d.name },
    { name: 'examcategories', collection: 'examcategories', source: (d) => `${d.name || ''}${d.type ? ' ' + d.type : ''}` },
    { name: 'subjects', collection: 'subjects', source: (d) => d.name },
    { name: 'topics', collection: 'topics', source: (d) => d.name },
    { name: 'quizzes', collection: 'quizzes', source: (d) => d.title },
    { name: 'practicetests', collection: 'practicetests', source: (d) => d.title },
    { name: 'currentaffairs', collection: 'currentaffairs', source: (d) => `${dateSegment(d.date)} ${d.title || ''}`.trim() },
    { name: 'examnews', collection: 'examnews', source: (d) => d.title }
];

async function backfillCollection(db, target) {
    const coll = db.collection(target.collection);

    // Build the in-memory taken-set from documents that already have a slug so
    // we never collide against pre-existing values during this run.
    const taken = new Set(
        (await coll.find({ slug: { $type: 'string', $ne: '' } }, { projection: { slug: 1 } }).toArray())
            .map((d) => d.slug)
    );

    const cursor = coll.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
    let updated = 0;
    let skipped = 0;
    let docs = [];

    while (await cursor.hasNext()) {
        const doc = await cursor.next();
        const source = target.source(doc);
        if (!source || !String(source).trim()) {
            skipped += 1;
            continue;
        }

        const base = slugify(source);
        let candidate = base;
        let suffix = 1;
        while (taken.has(candidate)) {
            suffix += 1;
            const tail = `-${suffix}`;
            const trimmedBase = base.length + tail.length > MAX_LEN
                ? base.slice(0, MAX_LEN - tail.length).replace(/-+$/, '')
                : base;
            candidate = `${trimmedBase}${tail}`;
        }
        taken.add(candidate);
        docs.push({ _id: doc._id, slug: candidate });

        if (docs.length >= 500) {
            await Promise.all(docs.map((d) => coll.updateOne({ _id: d._id }, { $set: { slug: d.slug } })));
            updated += docs.length;
            docs = [];
        }
    }

    if (docs.length) {
        await Promise.all(docs.map((d) => coll.updateOne({ _id: d._id }, { $set: { slug: d.slug } })));
        updated += docs.length;
    }

    const total = await coll.estimatedDocumentCount();
    const withSlug = await coll.countDocuments({ slug: { $type: 'string', $ne: '' } });
    console.log(`  ${target.name}: backfilled ${updated}, skipped ${skipped} (no source). Coverage: ${withSlug}/${total} have a slug.`);
}

async function ensureUniqueIndexes(db) {
    for (const t of targets) {
        try {
            await db.collection(t.collection).createIndex({ slug: 1 }, { unique: true, sparse: true, name: 'slug_1' });
        } catch (err) {
            // Index may already exist with a different definition; surface as a warning.
            console.warn(`  index warning for ${t.name}: ${err.message}`);
        }
    }
}

(async () => {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    console.log('Connected to', db.databaseName);

    console.log('\nBackfilling slugs:');
    for (const t of targets) {
        try {
            await backfillCollection(db, t);
        } catch (err) {
            console.error(`  ${t.name}: FAILED`, err.message);
        }
    }

    console.log('\nEnsuring unique indexes on slug:');
    await ensureUniqueIndexes(db);

    await mongoose.disconnect();
    console.log('\nDone.');
    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
