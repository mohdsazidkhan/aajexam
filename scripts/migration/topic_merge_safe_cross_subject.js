// Phase 2a: cross-subject duplicate-name topic groups where AT MOST ONE topic is in use (questions/quizzes/notes/decks).
// The unused duplicates are marked mergedInto + isActive:false, their slug goes to survivor.previousSlugs. No repointing needed.
// Dry-run unless --go. Backup JSON written before writes.
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
    const use = new Map();
    for (const col of REF_COLS) {
        const r = await db.collection(col).aggregate([{ $match: { topic: { $ne: null } } }, { $group: { _id: '$topic', n: { $sum: 1 } } }]).toArray();
        r.forEach(x => use.set(String(x._id), (use.get(String(x._id)) || 0) + x.n));
    }
    const u = t => use.get(String(t._id)) || 0;
    const g = new Map();
    for (const t of topics) { const k = agg(t.name); if (k) (g.get(k) || g.set(k, []).get(k)).push(t); }
    const plan = [];
    for (const a of g.values()) {
        if (a.length < 2 || new Set(a.map(t => String(t.subject))).size < 2) continue;
        if (a.filter(t => u(t) > 0).length > 1) continue;
        a.sort((x, y) => u(y) - u(x) || (y.isActive !== false) - (x.isActive !== false) || x._id.getTimestamp() - y._id.getTimestamp());
        plan.push({ survivor: a[0], losers: a.slice(1) });
    }
    const nLosers = plan.reduce((s, p) => s + p.losers.length, 0);
    console.log('groups', plan.length, 'losers', nLosers, '| survivors in use', plan.filter(p => u(p.survivor) > 0).length);
    if (plan.some(p => p.losers.some(l => u(l) > 0))) throw new Error('loser in use - abort');
    if (!GO) { console.log('DRY RUN'); return m.disconnect(); }
    const bak = path.join(__dirname, `topic_merge2a_backup_${Date.now()}.json`);
    fs.writeFileSync(bak, JSON.stringify(plan.flatMap(p => [p.survivor, ...p.losers])));
    console.log('backup ->', bak);
    const now = new Date();
    for (const p of plan) {
        const s = p.survivor;
        const prev = new Set(s.previousSlugs || []);
        for (const l of p.losers) { if (l.slug && l.slug !== s.slug) prev.add(l.slug); (l.previousSlugs || []).forEach(x => x !== s.slug && prev.add(x)); }
        await db.collection('topics').updateOne({ _id: s._id }, { $set: { previousSlugs: [...prev], updatedAt: now } });
        await db.collection('topics').updateMany({ _id: { $in: p.losers.map(l => l._id) } }, { $set: { mergedInto: s._id, isActive: false, updatedAt: now } });
    }
    console.log('merged losers now', await db.collection('topics').countDocuments({ mergedInto: { $in: plan.map(p => p.survivor._id) } }));
    await m.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
