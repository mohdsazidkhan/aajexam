// Phase 1 topic merge: topics in the SAME subject whose names differ only by case / & vs and / plural / word order.
// Dry-run unless --go. Survivor = most-used (questions+quizzes+notes+decks), then active, then oldest.
// Repoints questions/quizzes/studynotes/flashcarddecks .topic, sets loser mergedInto + isActive:false,
// pushes loser slug(s) into survivor.previousSlugs, unions exams. Backup JSON written before any write.
//   node scripts/migration/topic_merge_same_subject.js [--go]
const fs = require('fs');
const path = require('path');
const m = require('mongoose');
const env = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const GO = process.argv.includes('--go');
const REF_COLS = ['questions', 'quizzes', 'studynotes', 'flashcarddecks'];
const STOP = new Set(['and', 'of', 'the', 'in', 'a', 'to', 'for']);
const norm = s => String(s || '').normalize('NFC').toLowerCase().replace(/&/g, 'and').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const agg = s => norm(s).split(' ').filter(w => w && !STOP.has(w)).map(w => w.replace(/s$/, '')).sort().join(' ');

(async () => {
    await m.connect(uri);
    const db = m.connection.db;
    const topics = await db.collection('topics').find({ mergedInto: { $exists: false } }).toArray();
    const usage = new Map();
    for (const col of REF_COLS) {
        const r = await db.collection(col).aggregate([{ $match: { topic: { $ne: null } } }, { $group: { _id: '$topic', n: { $sum: 1 } } }]).toArray();
        r.forEach(x => usage.set(String(x._id), (usage.get(String(x._id)) || 0) + x.n));
    }
    const use = t => usage.get(String(t._id)) || 0;
    const g = new Map();
    for (const t of topics) { const k = String(t.subject) + '|' + agg(t.name); (g.get(k) || g.set(k, []).get(k)).push(t); }
    const groups = [...g.values()].filter(a => a.length > 1);
    const plan = groups.map(a => {
        a.sort((x, y) => use(y) - use(x) || (y.isActive !== false) - (x.isActive !== false) || x._id.getTimestamp() - y._id.getTimestamp());
        return { survivor: a[0], losers: a.slice(1) };
    });
    for (const p of plan) console.log(`KEEP "${p.survivor.name}"(${use(p.survivor)}) <- ${p.losers.map(l => `"${l.name}"(${use(l)})`).join(', ')}`);
    const loserIds = plan.flatMap(p => p.losers.map(l => l._id));
    const refs = {};
    for (const col of REF_COLS) refs[col] = await db.collection(col).find({ topic: { $in: loserIds } }, { projection: { _id: 1, topic: 1 } }).toArray();
    console.log('refs to repoint', Object.fromEntries(Object.entries(refs).map(([k, v]) => [k, v.length])));
    if (!GO) { console.log('DRY RUN - pass --go to apply'); return m.disconnect(); }

    const bakPath = path.join(__dirname, `topic_merge1_backup_${Date.now()}.json`);
    fs.writeFileSync(bakPath, JSON.stringify({ topics: plan.flatMap(p => [p.survivor, ...p.losers]), refs }));
    console.log('backup ->', bakPath);
    const now = new Date();
    for (const p of plan) {
        const s = p.survivor;
        for (const l of p.losers) {
            for (const col of REF_COLS) await db.collection(col).updateMany({ topic: l._id }, { $set: { topic: s._id } });
        }
        const prev = new Set([...(s.previousSlugs || [])]);
        const exams = new Map((s.exams || []).map(e => [String(e), e]));
        let active = s.isActive !== false;
        for (const l of p.losers) {
            if (l.slug && l.slug !== s.slug) prev.add(l.slug);
            (l.previousSlugs || []).forEach(x => x !== s.slug && prev.add(x));
            (l.exams || []).forEach(e => exams.set(String(e), e));
            if (l.isActive !== false) active = true;
        }
        await db.collection('topics').updateOne({ _id: s._id }, { $set: { previousSlugs: [...prev], exams: [...exams.values()], isActive: active, updatedAt: now } });
        await db.collection('topics').updateMany({ _id: { $in: p.losers.map(l => l._id) } }, { $set: { mergedInto: s._id, isActive: false, updatedAt: now } });
    }
    // verify
    for (const col of REF_COLS) console.log('left on losers', col, await db.collection(col).countDocuments({ topic: { $in: loserIds } }));
    await m.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
