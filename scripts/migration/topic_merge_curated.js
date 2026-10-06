// Phase 2b: curated cross-subject topic merges from topic_merge_review.csv (group numbers = CSV `group` column).
// Only same-exam-domain groups; Hindi/state-specific/computer subjects are excluded from groups, some groups skipped entirely.
// Survivor = most-used topic. Repoints questions/quizzes/studynotes/flashcarddecks .topic AND .subject (page requires
// topic.subject === subject), loser -> mergedInto + isActive:false, loser slug -> survivor.previousSlugs, exams unioned.
// Dry-run unless --go. Backup JSON of every touched doc id (old topic/subject) + topic docs written first.
const fs = require('fs');
const path = require('path');
const m = require('mongoose');
const env = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const GO = process.argv.includes('--go');
const REF_COLS = ['questions', 'quizzes', 'studynotes', 'flashcarddecks'];
const SKIP_GROUPS = new Set([20, 103, 50, 66, 107, 117, 123, 125, 128, 134, 143, 148]);
const EXCLUDE_SUBJECTS = new Set(['General Hindi', 'Rajasthan GK', 'Rajasthan General Studies', 'Haryana GK', 'State Specific GK', 'Computer Awareness / Fundamentals']);
const INCLUDE = [1, 6, 9, 12, 15, 17, 19, 20, 21, 22, 24, 26, 28, 29, 30, 31, 34, 35, 37, 40, 41, 42, 44, 47, 48, 49, 51, 54, 57, 64, 65, 67, 68, 69, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 85, 93, 102, 103, 104, 105, 106, 108, 109, 110, 111, 112, 113, 114, 115, 116, 118, 119, 120, 121, 122, 124, 126, 127, 129, 130, 131, 132, 133, 135, 136, 137, 138, 139, 140, 141, 142, 144, 145, 146, 147, 149, 150, 151, 152, 153, 154, 156, 157, 158, 161, 233, 234].filter(g => !SKIP_GROUPS.has(g));

function parseCsv(txt) {
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < txt.length; i++) {
        const c = txt[i];
        if (q) { if (c === '"') { if (txt[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
        else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; } else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else if (c !== '\r') cur += c;
    }
    return rows;
}

(async () => {
    const rows = parseCsv(fs.readFileSync(path.join(__dirname, 'topic_merge_review.csv'), 'utf8').replace(/^﻿/, '')).slice(1).filter(r => r.length > 8);
    const byGroup = new Map();
    for (const r of rows) { const g = Number(r[0]); (byGroup.get(g) || byGroup.set(g, []).get(g)).push({ subjectName: r[4], id: r[8] }); }
    await m.connect(uri);
    const db = m.connection.db;
    const oid = s => new m.Types.ObjectId(s);
    const plan = [];
    for (const g of INCLUDE) {
        const members = (byGroup.get(g) || []).filter(x => !EXCLUDE_SUBJECTS.has(x.subjectName));
        if (members.length < 2) continue;
        const docs = await db.collection('topics').find({ _id: { $in: members.map(x => oid(x.id)) }, mergedInto: { $exists: false } }).toArray();
        if (docs.length < 2) continue;
        const cnt = {};
        for (const d of docs) { let n = 0; for (const c of REF_COLS) n += await db.collection(c).countDocuments({ topic: d._id }); cnt[d._id] = n; }
        docs.sort((a, b) => cnt[b._id] - cnt[a._id] || (b.isActive !== false) - (a.isActive !== false));
        plan.push({ g, survivor: docs[0], losers: docs.slice(1), cnt });
    }
    const subj = new Map((await db.collection('subjects').find({}).toArray()).map(s => [String(s._id), s.name]));
    let moveQ = 0, moveQz = 0;
    for (const p of plan) {
        const ids = p.losers.map(l => l._id);
        const [q, qz] = [await db.collection('questions').countDocuments({ topic: { $in: ids } }), await db.collection('quizzes').countDocuments({ topic: { $in: ids } })];
        moveQ += q; moveQz += qz;
        console.log(`g${p.g} KEEP "${p.survivor.name}"[${subj.get(String(p.survivor.subject))}] <- ${p.losers.map(l => `"${l.name}"[${subj.get(String(l.subject))}:${p.cnt[l._id]}]`).join(', ')}`);
    }
    console.log('groups', plan.length, 'losers', plan.reduce((s, p) => s + p.losers.length, 0), 'questions to move', moveQ, 'quizzes', moveQz);
    if (!GO) { console.log('DRY RUN'); return m.disconnect(); }

    const backup = { topics: [], refs: {} };
    for (const c of REF_COLS) backup.refs[c] = [];
    for (const p of plan) {
        backup.topics.push(p.survivor, ...p.losers);
        const ids = p.losers.map(l => l._id);
        for (const c of REF_COLS) backup.refs[c].push(...await db.collection(c).find({ topic: { $in: ids } }, { projection: { _id: 1, topic: 1, subject: 1 } }).toArray());
    }
    const bak = path.join(__dirname, `topic_merge2b_backup_${Date.now()}.json`);
    fs.writeFileSync(bak, JSON.stringify(backup));
    console.log('backup ->', bak);
    const now = new Date();
    for (const p of plan) {
        const s = p.survivor;
        for (const l of p.losers) for (const c of REF_COLS) await db.collection(c).updateMany({ topic: l._id }, { $set: { topic: s._id, subject: s.subject } });
        const prev = new Set(s.previousSlugs || []);
        const exams = new Map((s.exams || []).map(e => [String(e), e]));
        for (const l of p.losers) { if (l.slug && l.slug !== s.slug) prev.add(l.slug); (l.previousSlugs || []).forEach(x => x !== s.slug && prev.add(x)); (l.exams || []).forEach(e => exams.set(String(e), e)); }
        const set = { previousSlugs: [...prev], exams: [...exams.values()], updatedAt: now };
        // all-lowercase survivor name -> borrow a properly-cased loser name (slug untouched; redirects keep working)
        const nice = s.name === s.name.toLowerCase() ? p.losers.find(l => l.name !== l.name.toLowerCase()) : null;
        if (nice) set.name = nice.name;
        await db.collection('topics').updateOne({ _id: s._id }, { $set: set });
        await db.collection('topics').updateMany({ _id: { $in: p.losers.map(l => l._id) } }, { $set: { mergedInto: s._id, isActive: false, updatedAt: now } });
    }
    const allLosers = plan.flatMap(p => p.losers.map(l => l._id));
    for (const c of REF_COLS) console.log('left on losers', c, await db.collection(c).countDocuments({ topic: { $in: allLosers } }));
    await m.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
