// Read-only: builds topic_merge_review.csv — cross-subject duplicate-name topic groups for manual review.
const fs = require('fs');
const path = require('path');
const m = require('mongoose');
const env = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const REF_COLS = ['questions', 'quizzes', 'studynotes', 'flashcarddecks'];
const STOP = new Set(['and', 'of', 'the', 'in', 'a', 'to', 'for']);
const norm = s => String(s || '').normalize('NFC').toLowerCase().replace(/&/g, 'and').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const agg = s => norm(s).split(' ').filter(w => w && !STOP.has(w)).map(w => w.replace(/s$/, '')).sort().join(' ');
const q = s => '"' + String(s).replace(/"/g, '""') + '"';

(async () => {
    await m.connect(uri);
    const db = m.connection.db;
    const topics = await db.collection('topics').find({ mergedInto: { $exists: false } }).toArray();
    const subs = new Map((await db.collection('subjects').find({}).toArray()).map(s => [String(s._id), s.name]));
    const qn = new Map(), other = new Map();
    for (const col of REF_COLS) {
        const r = await db.collection(col).aggregate([{ $match: { topic: { $ne: null } } }, { $group: { _id: '$topic', n: { $sum: 1 } } }]).toArray();
        r.forEach(x => (col === 'questions' ? qn : other).set(String(x._id), (col === 'questions' ? 0 : other.get(String(x._id)) || 0) + x.n));
    }
    const g = new Map();
    for (const t of topics) { const k = agg(t.name); if (k) (g.get(k) || g.set(k, []).get(k)).push(t); }
    const groups = [...g.values()].filter(a => a.length > 1 && new Set(a.map(t => String(t.subject))).size > 1);
    const gi = groups.map(a => ({ a, qs: a.reduce((s, t) => s + (qn.get(String(t._id)) || 0), 0) })).sort((x, y) => y.qs - x.qs);
    const lines = ['group,keep_this_one,merge,topic_name,subject,questions,quizzes_notes_decks,active,topic_id'];
    gi.forEach(({ a }, i) => {
        a.sort((x, y) => (qn.get(String(y._id)) || 0) - (qn.get(String(x._id)) || 0));
        a.forEach((t, j) => lines.push([i + 1, j === 0 ? 'KEEP' : '', '', q(t.name), q(subs.get(String(t.subject)) || '?'), qn.get(String(t._id)) || 0, other.get(String(t._id)) || 0, t.isActive !== false ? 'Y' : 'N', t._id].join(',')));
    });
    const out = path.join(__dirname, 'topic_merge_review.csv');
    fs.writeFileSync(out, '﻿' + lines.join('\n'));
    const needMove = gi.filter(({ a }) => a.filter(t => (qn.get(String(t._id)) || 0) > 0).length >= 2).length;
    const emptyOnly = gi.filter(({ a }) => a.filter(t => (qn.get(String(t._id)) || 0) + (other.get(String(t._id)) || 0) > 0).length <= 1).length;
    console.log('groups', gi.length, 'docs', gi.reduce((s, x) => s + x.a.length, 0), '| >=2 topics with questions', needMove, '| at most 1 topic in use (trivial)', emptyOnly);
    console.log('top 15:'); gi.slice(0, 15).forEach(({ a, qs }) => console.log(' ', qs, a.map(t => `${t.name} [${subs.get(String(t.subject))}:${qn.get(String(t._id)) || 0}]`).join(' | ')));
    console.log('wrote', out);
    await m.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
