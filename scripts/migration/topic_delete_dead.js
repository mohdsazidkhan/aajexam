// Deletes dead Topic docs: (A) merged losers (mergedInto set) and (B) unused non-merged topics that no merged loser points to.
// "Unused" = no ref in questions/quizzes/studynotes/flashcarddecks. Dry-run unless --go. Full-doc backup JSON written first.
const fs = require('fs');
const path = require('path');
const m = require('mongoose');
const env = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const GO = process.argv.includes('--go');
const REF_COLS = ['questions', 'quizzes', 'studynotes', 'flashcarddecks'];
(async () => {
    await m.connect(uri);
    const db = m.connection.db;
    const used = new Set();
    for (const c of REF_COLS) (await db.collection(c).distinct('topic')).forEach(x => x && used.add(String(x)));
    const all = await db.collection('topics').find({}).toArray();
    const targets = new Set(all.filter(t => t.mergedInto).map(t => String(t.mergedInto)));
    const del = all.filter(t => !used.has(String(t._id)) && (t.mergedInto || !targets.has(String(t._id))));
    console.log('total', all.length, 'to delete', del.length, '(merged', del.filter(t => t.mergedInto).length, 'unused', del.filter(t => !t.mergedInto).length, ') remaining', all.length - del.length);
    if (!GO) { console.log('DRY RUN'); return m.disconnect(); }
    const bak = path.join(__dirname, `topic_delete_backup_${Date.now()}.json`);
    fs.writeFileSync(bak, JSON.stringify(del));
    console.log('backup ->', bak);
    const r = await db.collection('topics').deleteMany({ _id: { $in: del.map(t => t._id) } });
    console.log('deleted', r.deletedCount, 'remaining', await db.collection('topics').countDocuments());
    await m.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
