// Exam-syllabus based merge of alphabet/coding topics (explicit survivor chosen by name, not by usage):
//   Alphabet            -> Alphabet Test   (same chapter: letter position / gaps)      [General Intelligence & Reasoning]
//   Alphabet Coding     -> Coding-Decoding (letter coding is part of coding-decoding)  [Reasoning / Logical Ability]
//   Coding              -> Coding-Decoding
// Alphabet Series stays separate (it belongs to the Series chapter). Repoints .topic AND .subject on the 4 ref collections,
// loser -> mergedInto + isActive:false, loser slug -> survivor.previousSlugs, exams unioned. Dry-run unless --go. Backup first.
const fs = require('fs');
const path = require('path');
const m = require('mongoose');
const env = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const GO = process.argv.includes('--go');
const REF_COLS = ['questions', 'quizzes', 'studynotes', 'flashcarddecks'];
const RULES = [
    { survivor: ['Alphabet Test', 'General Intelligence & Reasoning'], losers: [['Alphabet', 'General Intelligence & Reasoning']] },
    { survivor: ['Coding-Decoding', 'Reasoning / Logical Ability'], losers: [['Alphabet Coding', 'General Intelligence & Reasoning'], ['Coding', 'Reasoning & Mental Aptitude']] },
];
(async () => {
    await m.connect(uri);
    const db = m.connection.db;
    const subs = new Map((await db.collection('subjects').find({}).toArray()).map(s => [s.name, s._id]));
    const find = async ([name, subj]) => {
        const docs = await db.collection('topics').find({ name, subject: subs.get(subj), mergedInto: { $exists: false } }).toArray();
        if (docs.length !== 1) throw new Error(`expected 1 topic "${name}" in "${subj}", got ${docs.length}`);
        return docs[0];
    };
    const plan = [];
    for (const r of RULES) plan.push({ survivor: await find(r.survivor), losers: await Promise.all(r.losers.map(find)) });
    for (const p of plan) {
        const ids = p.losers.map(l => l._id);
        console.log(`KEEP "${p.survivor.name}" <- ${p.losers.map(l => `"${l.name}"`).join(', ')} | questions ${await db.collection('questions').countDocuments({ topic: { $in: ids } })} quizzes ${await db.collection('quizzes').countDocuments({ topic: { $in: ids } })}`);
    }
    if (!GO) { console.log('DRY RUN'); return m.disconnect(); }
    const backup = { topics: [], refs: {} };
    for (const c of REF_COLS) backup.refs[c] = [];
    for (const p of plan) {
        backup.topics.push(p.survivor, ...p.losers);
        for (const c of REF_COLS) backup.refs[c].push(...await db.collection(c).find({ topic: { $in: p.losers.map(l => l._id) } }, { projection: { _id: 1, topic: 1, subject: 1 } }).toArray());
    }
    const bak = path.join(__dirname, `topic_merge_alphabet_backup_${Date.now()}.json`);
    fs.writeFileSync(bak, JSON.stringify(backup));
    console.log('backup ->', bak);
    const now = new Date();
    for (const p of plan) {
        const s = p.survivor;
        for (const l of p.losers) for (const c of REF_COLS) await db.collection(c).updateMany({ topic: l._id }, { $set: { topic: s._id, subject: s.subject } });
        const prev = new Set(s.previousSlugs || []);
        const exams = new Map((s.exams || []).map(e => [String(e), e]));
        for (const l of p.losers) { if (l.slug && l.slug !== s.slug) prev.add(l.slug); (l.previousSlugs || []).forEach(x => x !== s.slug && prev.add(x)); (l.exams || []).forEach(e => exams.set(String(e), e)); }
        await db.collection('topics').updateOne({ _id: s._id }, { $set: { previousSlugs: [...prev], exams: [...exams.values()], updatedAt: now } });
        await db.collection('topics').updateMany({ _id: { $in: p.losers.map(l => l._id) } }, { $set: { mergedInto: s._id, isActive: false, updatedAt: now } });
    }
    const all = plan.flatMap(p => p.losers.map(l => l._id));
    for (const c of REF_COLS) console.log('left on losers', c, await db.collection(c).countDocuments({ topic: { $in: all } }));
    await m.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
