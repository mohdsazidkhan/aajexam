// Removes question text / options / answers that are COPIED outside `questions`, keeping only the link. `questions` is the source of
// truth. Every stage is a dry-run unless --go is passed, and an element is only ever touched when its content is IDENTICAL to the
// `questions` document it links to, so no information is lost (hydrating it returns exactly what was removed).
//
//   node --max-old-space-size=6144 scripts/migration/compact.js --stage=check            # read-only report for all three
//   --stage=tests | daily | revision   [--go]
//
//   tests    practicetests.questions[]   keeps { _id (= Question id), section, explanationImage }
//   daily    dailychallenges.questions[] gets  { question: <Question id> }, loses text / options / explanation
//   revision revisionqueues              gets  questionRef, loses questionSnapshot text / options / answer / explanation (labels stay)
// The application code (PracticeTest / DailyChallenge / RevisionQueue models, hydrateTestQuestions.js and the routes) must be live
// BEFORE --go, because it is what reads the content back from `questions`.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const m = require('mongoose');
const env = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const args = process.argv.slice(2);
const STAGE = (args.find((a) => a.startsWith('--stage=')) || '').split('=')[1];
const GO = args.includes('--go');
const T0 = Date.now();
const log = (s) => console.log(`[${String(Math.round((Date.now() - T0) / 1000)).padStart(5)}s] ${s}`);
const oid = (s) => new m.Types.ObjectId(String(s));
const ws = (x) => String(x == null ? '' : x).normalize('NFC').replace(/\s+/g, ' ').trim();
const H = (s) => crypto.createHash('md5').update(s).digest('hex');
const SEP = '\u0003';
const chunks = (a, n) => { const r = []; for (let i = 0; i < a.length; i += n) r.push(a.slice(i, i + n)); return r; };
const CONTENT = ['questionText', 'questionImage', 'options', 'optionImages', 'correctAnswerIndex', 'explanation', 'tags', 'difficulty'];
// strict content key, same formulas as the migration scripts and mirrorTestQuestions.js
const docKey = (d) => { const o = d.options || []; const ci = o.findIndex((x) => x && x.isCorrect); return H([ws(d.questionText), d.image || '', o.map((x) => ws(x.text) + SEP + (x.image || '')).join('\u0001'), ci].join('\u0002')); };
const elKey = (q) => { const o = (q.options || []).map(ws); const im = q.optionImages || []; return H([ws(q.questionText), q.questionImage || '', o.map((x, i) => x + SEP + (im[i] || '')).join('\u0001'), q.correctAnswerIndex].join('\u0002')); };
const plainKey = (text, opts, ci) => H([ws(text), '', opts.map((o) => ws(o) + SEP).join('\u0001'), ci].join('\u0002'));
let db, client;

async function keyIndex() {
  const idx = new Map(); let n = 0;
  for await (const d of db.collection('questions').find({}, { projection: { questionText: 1, options: 1, image: 1, isActive: 1, createdAt: 1, explanation: 1 } })) {
    n++; const o = d.options || []; if (o.filter((x) => x && x.isCorrect).length !== 1) continue;
    const k = docKey(d); const e = { id: String(d._id), active: d.isActive !== false, at: +new Date(d.createdAt || 0), expl: ws(d.explanation) };
    const cur = idx.get(k); if (!cur || (e.active && !cur.active) || (e.active === cur.active && e.at < cur.at)) idx.set(k, e);
  }
  log(`questions indexed: ${n} docs, ${idx.size} distinct contents`);
  return idx;
}

// ---------------------------------------------------------------- practice tests / PYQs
async function stTests() {
  const S = { tests: 0, elems: 0, strip: 0, withoutContent: 0, noDoc: 0, differs: 0, explConflict: 0, explFill: 0, bytes: 0, testsChanged: 0, applied: 0, raced: 0, bad: 0 };
  const batch = [];
  const flush = async () => {
    if (!batch.length) return;
    const ids = [...new Set(batch.flatMap((t) => (t.questions || []).map((q) => String(q._id))))];
    const docs = new Map();
    for await (const d of db.collection('questions').find({ _id: { $in: ids.map(oid) } }, { projection: { questionText: 1, options: 1, image: 1, explanation: 1 } })) docs.set(String(d._id), d);
    for (const t of batch) {
      const unset = {}; const fills = []; const guard = {}; let any = false;
      (t.questions || []).forEach((q, i) => {
        S.elems++;
        if (!ws(q.questionText) || !(q.options || []).length) { S.withoutContent++; return; }
        const d = docs.get(String(q._id)); if (!d) { S.noDoc++; return; }
        if (elKey(q) !== docKey(d)) { S.differs++; return; }
        const e1 = ws(q.explanation), e2 = ws(d.explanation);
        if (e1 && e2 && e1 !== e2) { S.explConflict++; return; }
        if (e1 && !e2) { fills.push({ id: d._id, explanation: String(q.explanation).trim() }); S.explFill++; }
        for (const f of CONTENT) if (q[f] !== undefined) { unset[`questions.${i}.${f}`] = ''; S.bytes += JSON.stringify(q[f]).length; }
        guard[`questions.${i}._id`] = q._id; S.strip++; any = true;
      });
      if (!any) continue; S.testsChanged++;
      if (!GO) continue;
      if (fills.length) await db.collection('questions').bulkWrite(fills.map((f) => ({ updateOne: { filter: { _id: f.id, $or: [{ explanation: '' }, { explanation: { $exists: false } }] }, update: { $set: { explanation: f.explanation, updatedAt: new Date() } } } })), { ordered: false });
      const r = await db.collection('practicetests').updateOne({ _id: t._id, updatedAt: t.updatedAt, ...guard }, { $unset: unset });
      if (r.modifiedCount === 1) S.applied++; else { S.raced++; log(`  test ${t._id} changed meanwhile, left as it was (rerun later)`); }
    }
    batch.length = 0;
  };
  for await (const t of db.collection('practicetests').find({}, { projection: { updatedAt: 1, questions: 1 } })) {
    S.tests++; batch.push(t); if (batch.length >= 40) { await flush(); if (S.tests % 200 === 0) log(`  tests ${S.tests}`); }
  }
  await flush();
  log(`TESTS ${S.tests} tests, ${S.elems} elements | strippable ${S.strip} in ${S.testsChanged} tests (~${(S.bytes / 1048576).toFixed(1)} MB of text) | kept with content: no content ${S.withoutContent}, no questions doc ${S.noDoc}, content differs ${S.differs}, explanation conflict ${S.explConflict} | explanations to copy into questions ${S.explFill}${GO ? ` | APPLIED ${S.applied} tests, raced ${S.raced}` : ''}`);
}

// ---------------------------------------------------------------- daily challenges
async function stDaily(idx) {
  const S = { challenges: 0, elems: 0, linked: 0, already: 0, noMatch: 0, explKept: 0, applied: 0, raced: 0 };
  for await (const c of db.collection('dailychallenges').find({}, { projection: { updatedAt: 1, questions: 1 } })) {
    S.challenges++; const set = {}, unset = {}, guard = {}; let any = false;
    (c.questions || []).forEach((q, i) => {
      S.elems++;
      if (q.question && !ws(q.questionText)) { S.already++; return; }
      const o = q.options || []; const ci = o.findIndex((x) => x && x.isCorrect);
      if (!ws(q.questionText) || o.filter((x) => x && x.isCorrect).length !== 1) { S.noMatch++; return; }
      const hit = idx.get(plainKey(q.questionText, o.map((x) => x.text), ci));
      if (!hit) { S.noMatch++; return; }
      if (ws(q.explanation) && ws(q.explanation) !== hit.expl) { S.explKept++; return; }
      set[`questions.${i}.question`] = oid(hit.id); for (const f of ['questionText', 'options', 'explanation']) unset[`questions.${i}.${f}`] = '';
      guard[`questions.${i}._id`] = q._id; S.linked++; any = true;
    });
    if (any && GO) {
      const r = await db.collection('dailychallenges').updateOne({ _id: c._id, updatedAt: c.updatedAt, ...guard }, { $set: set, $unset: unset });
      if (r.modifiedCount === 1) S.applied++; else S.raced++;
    }
  }
  log(`DAILY ${S.challenges} challenges, ${S.elems} questions | link + strip ${S.linked} | already linked ${S.already} | no identical question in questions (kept as is) ${S.noMatch} | kept because of a different explanation ${S.explKept}${GO ? ` | APPLIED ${S.applied} challenges, raced ${S.raced}` : ''}`);
}

// ---------------------------------------------------------------- revision queue
async function stRevision(idx) {
  const S = { entries: 0, byRef: 0, byContent: 0, noMatch: 0, noSnapshot: 0, explKept: 0, differs: 0, applied: 0, raced: 0 };
  const rows = await db.collection('revisionqueues').find({}, { projection: { questionRef: 1, questionSnapshot: 1 } }).toArray();
  const refIds = [...new Set(rows.map((r) => r.questionRef).filter(Boolean).map(String))]; const docs = new Map();
  for (const c of chunks(refIds, 5000)) for await (const d of db.collection('questions').find({ _id: { $in: c.map(oid) } }, { projection: { questionText: 1, options: 1, image: 1, explanation: 1 } })) docs.set(String(d._id), d);
  const ops = [];
  for (const r of rows) {
    S.entries++; const sn = r.questionSnapshot || {};
    if (!ws(sn.questionText)) { S.noSnapshot++; continue; }
    let id = null;
    if (r.questionRef && docs.has(String(r.questionRef))) {
      const d = docs.get(String(r.questionRef)); const same = plainKey(sn.questionText, sn.options || [], sn.correctAnswerIndex) === docKey(d);
      if (!same) { S.differs++; continue; }
      if (ws(sn.explanation) && ws(sn.explanation) !== ws(d.explanation)) { S.explKept++; continue; }
      id = String(d._id); S.byRef++;
    } else {
      const hit = idx.get(plainKey(sn.questionText, sn.options || [], sn.correctAnswerIndex));
      if (!hit) { S.noMatch++; continue; }
      if (ws(sn.explanation) && ws(sn.explanation) !== hit.expl) { S.explKept++; continue; }
      id = hit.id; S.byContent++;
    }
    ops.push({ updateOne: { filter: { _id: r._id, 'questionSnapshot.questionText': sn.questionText }, update: { $set: { questionRef: oid(id) }, $unset: { 'questionSnapshot.questionText': '', 'questionSnapshot.options': '', 'questionSnapshot.correctAnswerIndex': '', 'questionSnapshot.explanation': '' } } } });
  }
  if (GO) for (const c of chunks(ops, 300)) { const r = await db.collection('revisionqueues').bulkWrite(c, { ordered: false }); S.applied += r.modifiedCount; }
  log(`REVISION ${S.entries} entries | strip with its existing questionRef ${S.byRef} | link by identical content + strip ${S.byContent} | snapshot is the only copy (kept) ${S.noMatch} | content differs from its question (kept) ${S.differs} | kept because of a different explanation ${S.explKept} | already compact ${S.noSnapshot}${GO ? ` | APPLIED ${S.applied}` : ''}`);
}

(async () => {
  const stages = ['check', 'tests', 'daily', 'revision'];
  if (!stages.includes(STAGE)) { console.log('usage: --stage=check|tests|daily|revision [--go]'); process.exit(2); }
  await m.connect(uri); db = m.connection.db; client = m.connection.getClient();
  log(`stage=${STAGE} mode=${GO ? 'GO (WRITES)' : 'dry-run (read-only)'}`);
  if (STAGE === 'check' || STAGE === 'tests') await stTests();
  if (STAGE === 'check' || STAGE === 'daily' || STAGE === 'revision') {
    const idx = await keyIndex();
    if (STAGE !== 'revision') await stDaily(idx);
    if (STAGE !== 'daily') await stRevision(idx);
  }
  log('DONE'); process.exit(0);
})().catch((e) => { console.error('ERR', e.stack || e.message); process.exit(1); });
