// Links the questions of PracticeTest / PYQ documents to the `questions` collection (the source of truth) and drops the copied content from
// the test, keeping only { _id (= Question id), section } per question. See src/lib/utils/mirrorTestQuestions.js.
// Run it after ANY seed that wrote tests with the raw driver (the PracticeTest model hooks only cover Mongoose saves). DRY-RUN unless --go.
//
//   node scripts/mirrorTests.mjs --since 2026-10-05            # tests created on/after a date (dry-run)
//   node scripts/mirrorTests.mjs --test <testId> [--test <id>] # specific tests (dry-run)
//   add --go to write. A test that already has attempts is never re-id'd (their answers are keyed by the question ids);
//   compacting a test whose ids stay the same is fine.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { linkAndCompactQuestions } from '../src/lib/utils/mirrorTestQuestions.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const env = fs.readFileSync(path.join(here, '../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const args = process.argv.slice(2);
const GO = args.includes('--go');
const ids = args.flatMap((a, i) => (a === '--test' ? [args[i + 1]] : []));
const sinceArg = args[args.indexOf('--since') + 1];
const since = args.includes('--since') ? new Date(sinceArg) : null;
if (!ids.length && !(since && !Number.isNaN(+since))) {
    console.log('usage: node scripts/mirrorTests.mjs (--since <date> | --test <id> ...) [--go]');
    process.exit(2);
}

await mongoose.connect(uri);
const db = mongoose.connection.db;
const filter = ids.length ? { _id: { $in: ids.map((i) => new mongoose.Types.ObjectId(i)) } } : { createdAt: { $gte: since } };
const tests = await db.collection('practicetests').find(filter).toArray();
console.log(`${GO ? 'GO (WRITES)' : 'dry-run (read-only)'}: ${tests.length} test(s) selected`);

let written = 0, hiddenCreated = 0, edited = 0, refused = 0;
for (const t of tests) {
    const attempts = await db.collection('usertestattempts').countDocuments({ practiceTest: t._id });
    const before = (t.questions || []).map((q) => String(q._id));
    // dry pass first (nothing written; new ids are assigned in memory only), so the report is the same in both modes
    const probe = (t.questions || []).map((q) => ({ ...q }));
    const dry = await linkAndCompactQuestions(probe, { examPatternId: t.examPattern, dryRun: true });
    const idsChange = probe.some((q, i) => String(q._id) !== before[i]);
    console.log(`${String(t._id)} "${String(t.title).slice(0, 40)}": ${dry.total} questions | already linked ${dry.unchanged} | edited in place ${dry.edited} | to link ${dry.reused} | hidden to create ${dry.created} | will be compacted ${dry.compacted} | kept with content ${dry.keptWithContent} | skipped ${dry.skipped.length}`
        + (attempts ? ` | HAS ${attempts} ATTEMPT(S)` : '') + (idsChange ? ' | ids would change' : ''));
    dry.skipped.slice(0, 3).forEach((s) => console.log(`     skipped: ${s.idx === undefined ? '' : `#${s.idx} `}${s.reason}`));
    if (attempts && idsChange) { refused += 1; console.log('     refused: ids would change but attempts exist'); continue; }
    if (!GO || !dry.compacted) continue;

    const questions = (t.questions || []).map((q) => ({ ...q })); // keep ObjectIds
    const res = await linkAndCompactQuestions(questions, { examPatternId: t.examPattern });
    const r = await db.collection('practicetests').updateOne({ _id: t._id, updatedAt: t.updatedAt }, { $set: { questions } });
    if (r.matchedCount !== 1) { console.log(`     NOT applied (test changed meanwhile): ${t._id}`); continue; }
    written += 1; hiddenCreated += res.created; edited += res.edited;
}
console.log(GO ? `done: ${written} tests written, ${hiddenCreated} hidden questions created, ${edited} questions edited in place, ${refused} refused (attempts exist and ids would change)` : `dry-run done (nothing written), ${refused} would be refused`);
await mongoose.disconnect();
