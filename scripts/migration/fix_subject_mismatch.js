// Makes .subject follow .topic's subject on questions/quizzes/studynotes/flashcarddecks (the practice topic page requires
// topic.subject === subject; topic is the authority). Dry-run unless --go. Backup JSON {col, _id, subject(old), topic} first.
const fs = require('fs');
const path = require('path');
const m = require('mongoose');
const env = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const GO = process.argv.includes('--go');
const COLS = ['questions', 'quizzes', 'studynotes', 'flashcarddecks'];
(async () => {
    await m.connect(uri);
    const db = m.connection.db;
    const topics = new Map((await db.collection('topics').find({ mergedInto: { $exists: false } }).project({ subject: 1 }).toArray()).map(t => [String(t._id), t.subject]));
    const work = {};
    for (const c of COLS) {
        work[c] = [];
        const rows = await db.collection(c).aggregate([{ $match: { topic: { $ne: null } } }, { $group: { _id: { topic: '$topic', subject: '$subject' }, ids: { $push: '$_id' } } }]).toArray();
        for (const r of rows) {
            const ts = topics.get(String(r._id.topic));
            if (ts && String(ts) !== String(r._id.subject)) work[c].push({ topic: r._id.topic, from: r._id.subject, to: ts, ids: r.ids });
        }
        console.log(c, 'docs to fix', work[c].reduce((s, w) => s + w.ids.length, 0), 'in', work[c].length, 'topic/subject groups');
    }
    if (!GO) { console.log('DRY RUN'); return m.disconnect(); }
    const bak = path.join(__dirname, `fix_subject_mismatch_backup_${Date.now()}.json`);
    fs.writeFileSync(bak, JSON.stringify(Object.fromEntries(COLS.map(c => [c, work[c].map(w => ({ topic: w.topic, from: w.from, to: w.to, ids: w.ids }))]))));
    console.log('backup ->', bak);
    for (const c of COLS) for (const w of work[c]) await db.collection(c).updateMany({ _id: { $in: w.ids } }, { $set: { subject: w.to } });
    for (const c of COLS) {
        let left = 0;
        const rows = await db.collection(c).aggregate([{ $match: { topic: { $ne: null } } }, { $group: { _id: { topic: '$topic', subject: '$subject' }, n: { $sum: 1 } } }]).toArray();
        for (const r of rows) { const ts = topics.get(String(r._id.topic)); if (ts && String(ts) !== String(r._id.subject)) left += r.n; }
        console.log('mismatch left', c, left);
    }
    await m.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
