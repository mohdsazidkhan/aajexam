// Builds src/data/footerLinks.json: the most popular exams, subjects and topics for the footer's direct links.
// The footer reads the file, so it needs no API call and the links are in the server-rendered HTML (good for SEO).
//
// Popularity: exams = number of PYQ papers, subjects / topics = number of published quizzes.
// Usage: node scripts/buildFooterLinks.js          (dry run: prints the lists)
//        node scripts/buildFooterLinks.js --write  (writes src/data/footerLinks.json)
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const WRITE = process.argv.includes('--write');
const EXAMS = 12;
const SUBJECTS = 12;
const TOPICS = 12;
const FAKE_EXAM = /central board of secondary education|cbse/i; // not a real exam, never link it
const norm = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
// "General Awareness" vs "General Awareness & Current Affairs": one is a prefix of the other, keep only the first (most popular)
const nearDuplicate = (a, b) => a === b || a.startsWith(b + ' ') || b.startsWith(a + ' ');
const GENERIC_TOPIC = /^(pyq mix|mix|mixed|general|misc|miscellaneous|others?)$/;

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const oid = (ids) => ids.filter(Boolean);

    // ── exams: by PYQ paper count ──
    const pyq = await db.collection('practicetests').aggregate([
        { $match: { isPYQ: true } },
        { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'p' } },
        { $unwind: '$p' },
        { $group: { _id: '$p.exam', n: { $sum: 1 } } },
        { $sort: { n: -1 } },
        { $limit: 120 },
    ]).toArray();
    const examDocs = await db.collection('exams').find({ _id: { $in: oid(pyq.map((r) => r._id)) }, isActive: true, actualExam: { $ne: false }, slug: { $type: 'string', $ne: '' } }, { projection: { name: 1, slug: 1 } }).toArray();
    const examById = new Map(examDocs.map((e) => [String(e._id), e]));
    const exams = pyq.map((r) => examById.get(String(r._id))).filter((e) => e && !FAKE_EXAM.test(e.name)).slice(0, EXAMS).map((e) => ({ name: e.name, slug: e.slug }));

    // ── subjects: by published quiz count ──
    const subCounts = await db.collection('quizzes').aggregate([
        { $match: { status: 'published', subject: { $ne: null } } },
        { $group: { _id: '$subject', n: { $sum: 1 } } },
        { $sort: { n: -1 } },
        { $limit: 120 },
    ]).toArray();
    const subDocs = await db.collection('subjects').find({ _id: { $in: oid(subCounts.map((r) => r._id)) }, isActive: { $ne: false }, slug: { $type: 'string', $ne: '' } }, { projection: { name: 1, slug: 1 } }).toArray();
    const subById = new Map(subDocs.map((s) => [String(s._id), s]));
    const subjects = [];
    for (const r of subCounts) {
        const s = subById.get(String(r._id));
        if (!s || subjects.some((x) => nearDuplicate(norm(x.name), norm(s.name)))) continue;
        subjects.push({ name: s.name, slug: s.slug });
        if (subjects.length === SUBJECTS) break;
    }
    // every subject name (not only the linked ones): a topic that only repeats a subject name is not a useful link
    const allSubjectNames = (await db.collection('subjects').find({}, { projection: { name: 1 } }).toArray()).map((x) => norm(x.name));

    // ── topics: by published quiz count; slug must resolve to exactly one topic (slugs are unique per subject only) ──
    const topCounts = await db.collection('quizzes').aggregate([
        { $match: { status: 'published', topic: { $ne: null } } },
        { $group: { _id: '$topic', n: { $sum: 1 } } },
        { $sort: { n: -1 } },
        { $limit: 400 },
    ]).toArray();
    const topDocs = await db.collection('topics').find({ _id: { $in: oid(topCounts.map((r) => r._id)) }, isActive: { $ne: false }, source: { $ne: 'practice_embedded' }, mergedInto: { $in: [null, undefined] }, slug: { $type: 'string', $ne: '' } }, { projection: { name: 1, slug: 1 } }).toArray();
    const topById = new Map(topDocs.map((t) => [String(t._id), t]));
    const topics = [];
    for (const r of topCounts) {
        const t = topById.get(String(r._id));
        if (!t) continue;
        const n = norm(t.name);
        if (GENERIC_TOPIC.test(n) || allSubjectNames.includes(n) || topics.some((x) => nearDuplicate(norm(x.name), n))) continue;
        if ((await db.collection('topics').countDocuments({ slug: t.slug })) !== 1) continue;
        topics.push({ name: t.name, slug: t.slug });
        if (topics.length === TOPICS) break;
    }

    const out = { exams, subjects, topics };
    console.log(`exams ${exams.length}: ${exams.map((e) => e.name).join(' | ')}`);
    console.log(`subjects ${subjects.length}: ${subjects.map((e) => e.name).join(' | ')}`);
    console.log(`topics ${topics.length}: ${topics.map((e) => e.name).join(' | ')}`);
    if (WRITE) {
        const file = path.join(__dirname, '..', 'src', 'data', 'footerLinks.json');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(out, null, 1));
        console.log('wrote', file);
    } else {
        console.log('dry run, pass --write to save');
    }
    await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
