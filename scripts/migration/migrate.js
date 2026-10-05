// Embedded PracticeTest/PYQ questions -> canonical `questions` docs (Option A: embedded _id BECOMES the Question _id).
// Driven by migr_plan_v3.json (written by migr_dry3.js). EVERY stage is a dry-run unless --go is passed.
//
//   node --max-old-space-size=6144 scripts/migration/migrate.js --stage=check        # read-only: runs every dry-run report once
//   node ... --stage=backup|topics|questions|translations|remap|cleanup|verify [--go]
//   cleanup additionally needs --confirm-delete.
// Order for the real run: backup -> topics -> questions -> translations -> remap -> verify -> cleanup.
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const m = require('mongoose');
const env = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');

const RUN = 'embv3';
const SOURCE = 'practice_embedded';           // keep in sync with src/lib/utils/embeddedSource.js
const MODEL_TAG = 'migrated:embedded-v3';
const BAK = c => `bak_${RUN}_${c}`;
const SUBJECT_ALIAS = { 'आंकिक क्षमता': 'Numerical Ability' };
const args = process.argv.slice(2);
const STAGE = (args.find(a => a.startsWith('--stage=')) || '').split('=')[1];
const GO = args.includes('--go'); const CONFIRM_DELETE = args.includes('--confirm-delete');
const T0 = Date.now();
const log = s => console.log(`[${String(Math.round((Date.now() - T0) / 1000)).padStart(5)}s] ${s}`);
const oid = s => new m.Types.ObjectId(String(s));
const ws = x => String(x == null ? '' : x).normalize('NFC').replace(/\s+/g, ' ').trim();
const H = s => crypto.createHash('md5').update(s).digest('hex');
const SEP = '\u0003';
const chunks = (a, n) => { const r = []; for (let i = 0; i < a.length; i += n) r.push(a.slice(i, i + n)); return r; };
// strict key — MUST stay identical to migr_dry3.js (embedded side) so the plan keys can be re-verified live
const embKey = q => { const opts = (q.options || []).map(ws); const imgs = q.optionImages || []; const pairs = opts.map((o, i) => o + SEP + (imgs[i] || '')); return H([ws(q.questionText), q.questionImage || '', pairs.join('\u0001'), q.correctAnswerIndex].join('\u0002')); };
const qDocKey = q => { const opts = q.options || []; const ci = opts.findIndex(o => o && o.isCorrect); const pairs = opts.map(o => ws(o.text) + SEP + (o.image || '')); return H([ws(q.questionText), q.image || '', pairs.join('\u0001'), ci].join('\u0002')); };

let db, client, P;

async function loadPlan() {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'migr_plan_v3.json'), 'utf8'));
  const byNew = new Map(), byOld = new Map(), memByTest = new Map();
  for (const g of raw.groups) {
    byNew.set(g.newId, g);
    for (const [old, test, idx, dup] of g.mem) {
      const e = { old, test, idx, dup: !!dup, g }; byOld.set(old, e);
      (memByTest.get(test) || memByTest.set(test, new Map()).get(test)).set(idx, e);
    }
  }
  P = { ...raw, byNew, byOld, memByTest, newGroups: raw.groups.filter(g => g.kind === 'new'), remapMembers: [...byOld.values()].filter(e => !e.dup) };
  log(`plan: ${raw.groups.length} groups (${P.newGroups.length} new), ${P.remapMembers.length} ids to remap, ${raw.translationWrites.length} translation writes`);
}

// ---- one streaming pass over practicetests: verifies each planned member against the LIVE doc, optionally captures content for new docs
async function scanMembers({ content = false } = {}) {
  const S = { tests: 0, elems: 0, stateOld: 0, stateNew: 0, idMismatch: 0, keyMismatch: 0, missing: 0, dupEmbeddedIds: 0, dupOld: 0, dupSameTest: 0, sharedCanonical: 0, nOpts: new Map(), content: new Map(), samples: [] };
  const seen = new Map(); // id -> first test it was seen in
  const cur = db.collection('practicetests').find({}, { projection: { 'questions._id': 1, 'questions.questionText': 1, 'questions.questionImage': 1, 'questions.options': 1, 'questions.optionImages': 1, 'questions.correctAnswerIndex': 1, 'questions.explanation': 1, 'questions.tags': 1, 'questions.difficulty': 1 } });
  for await (const t of cur) {
    S.tests++; const tid = String(t._id); const qs = t.questions || [];
    for (const q of qs) {
      S.elems++; const id = String(q._id); const prev = seen.get(id);
      if (prev === undefined) { seen.set(id, tid); continue; }
      S.dupEmbeddedIds++;
      // after remap the SAME canonical Question id legitimately appears in many tests (that is the point of the dedupe).
      // Only two repeats are real problems: a not-yet-remapped (old) id seen twice, or one canonical id twice inside the same test.
      if (P.byOld.has(id)) S.dupOld++; else if (prev === tid) S.dupSameTest++; else S.sharedCanonical++;
    }
    const ents = P.memByTest.get(tid); if (!ents) continue;
    for (const [idx, e] of ents) {
      const q = qs[idx]; if (!q) { S.missing++; continue; }
      const id = String(q._id); const st = id === e.old ? 'old' : id === e.g.newId ? 'new' : 'other';
      if (st === 'other') { S.idMismatch++; if (S.samples.length < 10) S.samples.push(`idMismatch test ${tid} idx ${idx} have ${id} want ${e.old}`); continue; }
      if (embKey(q) !== e.g.k) { S.keyMismatch++; if (S.samples.length < 10) S.samples.push(`keyMismatch test ${tid} idx ${idx} id ${id}`); continue; }
      st === 'old' ? S.stateOld++ : S.stateNew++;
      S.nOpts.set(e.old, (q.options || []).length);
      if (content && e.g.kind === 'new') {
        const imgs = q.optionImages || []; const c = S.content.get(e.g.newId);
        const expl = ws(q.explanation) ? String(q.explanation).trim() : '';
        if (!c) S.content.set(e.g.newId, { text: String(q.questionText).trim(), options: (q.options || []).map((o, i) => ({ text: String(o).trim(), isCorrect: i === q.correctAnswerIndex, image: imgs[i] || '' })), image: q.questionImage || '', explanation: expl, difficulty: q.difficulty === 'mixed' || !q.difficulty ? 'medium' : q.difficulty, tags: (q.tags || []).map(x => String(x).trim().toLowerCase()).filter(Boolean) });
        else if (!c.explanation && expl) c.explanation = expl;
      }
    }
    if (S.tests % 250 === 0) log(`  scanned ${S.tests} tests`);
  }
  log(`SCAN tests ${S.tests} elems ${S.elems} | members old-id ${S.stateOld} already-new-id ${S.stateNew} | idMismatch ${S.idMismatch} keyMismatch ${S.keyMismatch} missing ${S.missing} | repeated embedded ids: old-id repeats ${S.dupOld} (must be 0), same-test repeats ${S.dupSameTest} (must be 0), canonical ids shared across tests ${S.sharedCanonical} (expected after remap)`);
  S.samples.forEach(s => log('  ' + s));
  return S;
}

async function refData() {
  const exams = new Map(); for await (const e of db.collection('exams').find({}, { projection: { name: 1 } })) exams.set(String(e._id), e.name);
  const subjects = await db.collection('subjects').find({}, { projection: { name: 1, mergedInto: 1 } }).toArray();
  const subjById = new Map(subjects.map(s => [String(s._id), s]));
  const resolve = s => { let n = 0; while (s && s.mergedInto && n++ < 5) s = subjById.get(String(s.mergedInto)) || s; return s; };
  const subjByName = new Map(subjects.filter(s => !s.mergedInto).map(s => [s.name, s]));
  return { exams, subjById, resolve, subjByName };
}
// topic name per new group: "<Exam> – <Subject>"; unresolved subject -> alias by section
function topicSpecs(R) {
  const specs = new Map(); let unresolved = 0; const bad = [];
  for (const g of P.newGroups) {
    let sid = g.subject;
    if (!sid) { const nm = SUBJECT_ALIAS[g.section]; const s = nm && R.subjByName.get(nm); if (s) sid = String(s._id); }
    if (!sid) { unresolved++; bad.push(g.section); continue; }
    const s = R.resolve(R.subjById.get(sid)); const exam = R.exams.get(g.exam);
    if (!s || !exam) { unresolved++; bad.push(`${g.section}/${g.exam}`); continue; }
    g._subject = String(s._id); g._topicName = `${exam} – ${s.name}`; g._tk = `${g._subject}|${g._topicName}`;
    specs.set(g._tk, { subject: g._subject, name: g._topicName, n: (specs.get(g._tk)?.n || 0) + 1 });
  }
  return { specs, unresolved, bad };
}

// ---------------- stages ----------------
async function stBackup() {
  const cols = ['practicetests', 'usertestattempts', 'revisionqueues', 'questiontranslations'];
  const have = new Set((await db.listCollections().toArray()).map(c => c.name));
  for (const c of cols) {
    const n = await db.collection(c).estimatedDocumentCount(); const target = BAK(c);
    if (have.has(target)) { log(`BACKUP ${c}: ${target} ALREADY EXISTS (${await db.collection(target).estimatedDocumentCount()} docs) - skipping`); continue; }
    if (!GO) { log(`BACKUP (dry) ${c}: ${n} docs -> would copy to ${target}`); continue; }
    await db.collection(c).aggregate([{ $match: {} }, { $out: target }], { allowDiskUse: true }).toArray();
    const nb = await db.collection(target).countDocuments(); log(`BACKUP ${c}: ${n} -> ${target} ${nb} ${n === nb ? 'OK' : 'COUNT MISMATCH (live changed or failed)'}`);
  }
  fs.writeFileSync(path.join(__dirname, 'idmap_embv3.json'), JSON.stringify(P.remapMembers.map(e => [e.old, e.g.newId])));
  log('id map saved: scripts/migration/idmap_embv3.json (oldId -> newId)');
}

// compound sparse index (subject, slug) still indexes docs that have `subject` but no `slug`, so every hidden topic needs a unique slug per subject
const slugify = t => ws(t).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9ऀ-ॿ]+/g, '-').replace(/^-+|-+$/g, '');
async function stTopics() {
  const R = await refData(); const { specs, unresolved, bad } = topicSpecs(R);
  const existing = new Map(), usedSlug = new Set(), noSlug = [];
  for await (const t of db.collection('topics').find({}, { projection: { subject: 1, name: 1, slug: 1, source: 1 } })) {
    existing.set(`${t.subject}|${t.name}`, String(t._id)); if (t.slug) usedSlug.add(`${t.subject}|${t.slug}`);
    if (t.source === SOURCE && !t.slug) noSlug.push(t);
  }
  const mkSlug = (subject, name) => { const base = slugify(name) + '-pyq-mock'; let s = base, i = 2; while (usedSlug.has(`${subject}|${s}`)) s = `${base}-${i++}`; usedSlug.add(`${subject}|${s}`); return s; };
  const missing = [...specs.entries()].filter(([k]) => !existing.has(k));
  log(`TOPICS needed ${specs.size}, already exist ${specs.size - missing.length}, to create ${missing.length}, existing hidden topics lacking a slug ${noSlug.length}, unresolved groups ${unresolved} ${[...new Set(bad)].join(',')}`);
  log('  sample: ' + missing.slice(0, 3).map(([, v]) => `${v.name} -> ${slugify(v.name)}-pyq-mock`).join(' | '));
  if (unresolved) throw new Error('unresolved subject/exam for some new groups - fix before --go');
  if (!GO) return;
  for (const t of noSlug) await db.collection('topics').updateOne({ _id: t._id, slug: { $exists: false } }, { $set: { slug: mkSlug(String(t.subject), t.name) } });
  const now = new Date();
  const docs = missing.map(([, v]) => ({ subject: oid(v.subject), name: v.name, slug: mkSlug(v.subject, v.name), description: '', exams: [], previousSlugs: [], isActive: false, order: 0, source: SOURCE, createdAt: now, updatedAt: now }));
  for (const c of chunks(docs, 200)) await db.collection('topics').insertMany(c, { ordered: false });
  log(`TOPICS created ${docs.length}, slugs backfilled ${noSlug.length}`);
}

async function stQuestions(S) {
  const R = await refData(); const { specs, unresolved } = topicSpecs(R);
  if (unresolved) throw new Error('unresolved subject/exam - run topics stage dry first');
  const topicId = new Map(); for await (const t of db.collection('topics').find({ source: SOURCE }, { projection: { subject: 1, name: 1 } })) topicId.set(`${t.subject}|${t.name}`, String(t._id));
  const topicsMissing = [...specs.keys()].filter(k => !topicId.has(k)).length;
  const user = await db.collection('users').findOne({ _id: oid(P.createdBy.id) }, { projection: { email: 1 } });
  log(`QUESTIONS createdBy ${user ? user.email : 'NOT FOUND'}; hidden topics present ${topicId.size}/${specs.size} (missing ${topicsMissing})`);
  // existing targets must still match the plan key
  let exOk = 0, exBad = 0, exMissing = 0; const exIds = raw => raw.groups.filter(g => g.kind === 'existing').map(g => g.newId);
  for (const c of chunks(exIds(P), 4000)) {
    const found = new Map(); for await (const q of db.collection('questions').find({ _id: { $in: c.map(oid) } }, { projection: { questionText: 1, options: 1, image: 1 } })) found.set(String(q._id), q);
    for (const id of c) { const q = found.get(id); if (!q) { exMissing++; continue; } qDocKey(q) === P.byNew.get(id).k ? exOk++ : exBad++; }
  }
  log(`QUESTIONS existing targets: ok ${exOk}, key-changed ${exBad}, missing ${exMissing}`);
  // new ids must not already exist (unless this stage already ran)
  const newIds = P.newGroups.map(g => g.newId); let already = 0;
  for (const c of chunks(newIds, 5000)) already += await db.collection('questions').countDocuments({ _id: { $in: c.map(oid) } });
  const noContent = P.newGroups.filter(g => !S.content.has(g.newId)).length;
  const emptyOpt = [...S.content.values()].filter(c => c.options.some(o => !o.text)).length;
  log(`QUESTIONS new docs planned ${newIds.length}; already present ${already}; groups without readable content ${noContent}; with an empty option text ${emptyOpt}`);
  const bad = exBad + exMissing + noContent + emptyOpt + S.idMismatch + S.keyMismatch + S.missing + (user ? 0 : 1);
  if (!GO) { log(`QUESTIONS (dry) would insert ${newIds.length - already} docs. blocking problems: ${bad + topicsMissing}`); return; }
  if (bad || topicsMissing) throw new Error('blocking problems found, refusing to write');
  const now = new Date(); let ins = 0, dup = 0;
  for (const c of chunks(P.newGroups, 500)) {
    const docs = c.map(g => { const k = S.content.get(g.newId); return { _id: oid(g.newId), exam: oid(g.exam), subject: oid(g._subject), topic: oid(topicId.get(g._tk)), questionText: k.text, options: k.options, explanation: k.explanation, difficulty: k.difficulty, tags: k.tags, language: /[ऀ-ॿ]/.test(k.text) ? 'hi' : 'en', image: k.image, isActive: false, source: SOURCE, createdBy: oid(P.createdBy.id), createdAt: now, updatedAt: now }; });
    try { const r = await db.collection('questions').insertMany(docs, { ordered: false }); ins += r.insertedCount; }
    catch (e) { if (e.writeErrors && e.writeErrors.every(w => w.code === 11000)) { ins += e.result?.insertedCount ?? (docs.length - e.writeErrors.length); dup += e.writeErrors.length; } else throw e; }
  }
  log(`QUESTIONS inserted ${ins}, skipped existing ${dup}`);
}

async function loadSrcRows() {
  const srcIds = [...new Set(P.translationWrites.map(w => w.src))]; const rows = new Map();
  for (const c of chunks(srcIds, 5000)) for await (const r of db.collection('questiontranslations').find({ questionId: { $in: c.map(oid) }, lang: 'hi' }, { projection: { questionId: 1, questionText: 1, options: 1 } })) rows.set(String(r.questionId), r);
  return rows;
}
async function stTranslations(S) {
  const rows = await loadSrcRows(); let missing = 0, optMismatch = 0; const ops = [];
  for (const w of P.translationWrites) {
    const r = rows.get(w.src); const e = P.byOld.get(w.src);
    if (!r) { missing++; continue; }
    const n = S.nOpts.get(w.src); if (n !== undefined && r.options.length !== n) { optMismatch++; continue; }
    ops.push({ updateOne: { filter: { questionId: oid(w.q), lang: w.l }, update: { $setOnInsert: { questionId: oid(w.q), sourceType: 'test', sourceId: oid(e.test), lang: w.l, questionText: r.questionText, options: r.options, model: MODEL_TAG, createdAt: new Date(), updatedAt: new Date() } }, upsert: true } });
  }
  log(`TRANSLATIONS planned ${P.translationWrites.length}: ready ${ops.length}, source row missing ${missing}, option-count mismatch ${optMismatch}`);
  if (!GO) { log('TRANSLATIONS (dry) nothing written'); return; }
  if (missing || optMismatch) throw new Error('blocking problems found, refusing to write');
  let up = 0, ex = 0; for (const c of chunks(ops, 1000)) { const r = await db.collection('questiontranslations').bulkWrite(c, { ordered: false }); up += r.upsertedCount; ex += r.matchedCount; }
  log(`TRANSLATIONS upserted ${up}, already existed ${ex}`);
}

async function stRemap(S) {
  // dry numbers for dependents (exact match on the keys the transaction will use)
  const byTest = new Map(); for (const e of P.remapMembers) (byTest.get(e.test) || byTest.set(e.test, []).get(e.test)).push(e);
  const oldSet = new Set(P.remapMembers.map(e => e.old));
  let ansTouch = 0, attTouch = 0, rqKeyed = 0, rqLoose = 0; const rqOld = new Set();
  for await (const a of db.collection('usertestattempts').find({}, { projection: { practiceTest: 1, 'answers.questionId': 1 } })) { const ents = byTest.get(String(a.practiceTest)); if (!ents) continue; const ids = new Set(ents.map(e => e.old)); const n = (a.answers || []).filter(x => ids.has(String(x.questionId))).length; if (n) { attTouch++; ansTouch += n; } }
  for await (const r of db.collection('revisionqueues').find({ source: 'practice_test' }, { projection: { sourceId: 1, sourceQuestionId: 1 } })) { const id = String(r.sourceQuestionId); if (!oldSet.has(id)) continue; rqLoose++; rqOld.add(id); if (P.byOld.get(id).test === String(r.sourceId)) rqKeyed++; }
  log(`REMAP tests ${byTest.size}, ids ${P.remapMembers.length} (state: old ${S.stateOld}, already new ${S.stateNew}); attempts touched ${attTouch}, answers ${ansTouch}; revision entries by old id ${rqLoose}, of which match (source,sourceId,old) ${rqKeyed}`);
  if (rqLoose !== rqKeyed) log('  WARNING: some revision entries point at an old id from a different sourceId; they will be re-keyed by id only');
  if (!GO) { log('REMAP (dry) nothing written'); return; }
  if (S.idMismatch || S.keyMismatch || S.missing || S.dupOld || S.dupSameTest) throw new Error('scan found mismatches / unsafe duplicate embedded ids, refusing to write');
  const missingQ = []; for (const c of chunks(P.remapMembers.map(e => e.g.newId), 5000)) { const have = new Set(); for await (const q of db.collection('questions').find({ _id: { $in: c.map(oid) } }, { projection: { _id: 1 } })) have.add(String(q._id)); for (const id of c) if (!have.has(id)) missingQ.push(id); }
  if (missingQ.length) throw new Error(`${missingQ.length} target Question docs are missing - run questions stage first`);
  let done = 0, skipped = 0, failed = 0; const remappedTests = new Set();
  // never touch a test that a student is working on right now (auto-save refreshes updatedAt every 30s): do it later, after they finish
  const busy = async tid => (await db.collection('usertestattempts').countDocuments({ practiceTest: oid(tid), status: 'InProgress', updatedAt: { $gte: new Date(Date.now() - 120000) } })) > 0;
  let queue = [...byTest.entries()], round = 0;
  while (queue.length && !failed && round < 15) {
   const deferred = [];
   for (const [tid, ents] of queue) {
    if (await busy(tid)) { deferred.push([tid, ents]); continue; }
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const tests = db.collection('practicetests'); const t = await tests.findOne({ _id: oid(tid) }, { projection: { 'questions._id': 1 }, session });
        const todo = ents.filter(e => String(t.questions[e.idx]?._id) === e.old); const wrong = ents.filter(e => ![e.old, e.g.newId].includes(String(t.questions[e.idx]?._id)));
        if (wrong.length) throw new Error(`test ${tid}: ${wrong.length} elements changed since scan`);
        if (!todo.length) { skipped++; remappedTests.add(tid); return; }
        const filter = { _id: oid(tid) }, set = {}; for (const e of todo) { filter[`questions.${e.idx}._id`] = oid(e.old); set[`questions.${e.idx}._id`] = oid(e.g.newId); }
        const r = await tests.updateOne(filter, { $set: set }, { session }); if (r.matchedCount !== 1) throw new Error(`test ${tid}: concurrent change`);
        const map = new Map(todo.map(e => [e.old, e.g.newId]));
        for await (const a of db.collection('usertestattempts').find({ practiceTest: oid(tid) }, { projection: { 'answers.questionId': 1 }, session })) {
          const s2 = {}; (a.answers || []).forEach((x, j) => { const n = map.get(String(x.questionId)); if (n) s2[`answers.${j}.questionId`] = oid(n); });
          if (Object.keys(s2).length) await db.collection('usertestattempts').updateOne({ _id: a._id }, { $set: s2 }, { session });
        }
        for (const e of todo) if (rqOld.has(e.old)) await db.collection('revisionqueues').updateMany({ source: 'practice_test', sourceId: oid(tid), sourceQuestionId: oid(e.old) }, { $set: { sourceQuestionId: oid(e.g.newId), questionRef: oid(e.g.newId) } }, { session });
        done++; remappedTests.add(tid);
      });
    } catch (e) { failed++; log(`REMAP FAILED test ${tid}: ${e.message}`); break; } finally { await session.endSession(); }
    if ((done + skipped) % 25 === 0) log(`  remap progress: ${done} done, ${skipped} already done`);
   }
   queue = deferred;
   if (queue.length && !failed) { log(`REMAP: ${queue.length} tests have a live attempt right now - waiting 60s (round ${++round})`); await new Promise(r => setTimeout(r, 60000)); }
  }
  if (queue.length && !failed) log(`REMAP: ${queue.length} tests were NOT remapped because a student stayed active on them; rerun the stage later (it skips finished tests)`);
  // sweep: attempts / revision entries created or rewritten while the stage ran that still point at an old id of an already-remapped test
  if (!failed) {
    const mapDone = new Map(P.remapMembers.filter(e => remappedTests.has(e.test)).map(e => [e.old, e.g.newId]));
    let sa = 0, sr = 0, sc = 0;
    for await (const a of db.collection('usertestattempts').find({}, { projection: { 'answers.questionId': 1 } })) {
      const s2 = {}; (a.answers || []).forEach((x, j) => { const n = mapDone.get(String(x.questionId)); if (n) s2[`answers.${j}.questionId`] = oid(n); });
      if (Object.keys(s2).length) { await db.collection('usertestattempts').updateOne({ _id: a._id }, { $set: s2 }); sa++; }
    }
    for await (const r of db.collection('revisionqueues').find({ source: 'practice_test' }, { projection: { sourceQuestionId: 1 } })) {
      const n = mapDone.get(String(r.sourceQuestionId)); if (!n) continue;
      try { await db.collection('revisionqueues').updateOne({ _id: r._id }, { $set: { sourceQuestionId: oid(n), questionRef: oid(n) } }); sr++; } catch (e) { sc++; log(`  sweep: revision entry ${r._id} not re-keyed (${e.code === 11000 ? 'duplicate key' : e.message.slice(0, 60)})`); }
    }
    log(`REMAP sweep: ${sa} attempts and ${sr} revision entries re-keyed (${sc} conflicts)`);
  }
  log(`REMAP finished: ${done} tests updated, ${skipped} already done, ${failed} failed`);
  if (failed) process.exitCode = 1;
}

async function stCleanup(S) {
  const olds = P.remapMembers.map(e => e.old); let rows = 0, carried = 0, notCarried = 0;
  // a group is "carried" only if a canonical hi row exists for its new id: either planned to be written, or already on the existing Question doc
  // a canonical Hindi row must REALLY exist in the DB (not just be planned) before its old rows may be deleted
  const hasHi = new Set();
  const canonicalIds = [...new Set(P.remapMembers.map(e => e.g.newId))];
  for (const c of chunks(canonicalIds, 5000)) for await (const r of db.collection('questiontranslations').find({ questionId: { $in: c.map(oid) }, lang: 'hi' }, { projection: { questionId: 1 } })) hasHi.add(String(r.questionId));
  log(`CLEANUP canonical hi rows present in DB: ${hasHi.size}`);
  const lostGroups = new Set();
  for (const c of chunks(olds, 5000)) for await (const r of db.collection('questiontranslations').find({ questionId: { $in: c.map(oid) }, lang: 'hi' }, { projection: { questionId: 1 } })) { rows++; const g = P.byOld.get(String(r.questionId)).g; if (hasHi.has(g.newId)) carried++; else { notCarried++; lostGroups.add(g.newId); } }
  log(`CLEANUP old translation rows keyed by remapped old ids: ${rows} | group has a canonical hi row: ${carried} | NO canonical row (these rows would be lost, ${lostGroups.size} groups; digit-suspect skips): ${notCarried} | embedded ids still on old value: ${S ? S.stateOld : 'n/a (scan skipped in dry-run)'}`);
  if (!GO) { log('CLEANUP (dry) nothing deleted'); return; }
  if (!CONFIRM_DELETE) throw new Error('cleanup deletes rows: pass --confirm-delete');
  const retained = P.byOld.size - P.remapMembers.length; // members deliberately kept on their old id (same question twice in one test)
  if (!S || S.stateOld > retained || S.idMismatch || S.keyMismatch || S.missing) throw new Error(`remap is not complete (still old ${S && S.stateOld}, intentionally kept ${retained}) - refusing to delete old rows`);
  // never delete a row whose group has no canonical row yet
  const safe = olds.filter(o => hasHi.has(P.byOld.get(o).g.newId));
  let del = 0; for (const c of chunks(safe, 5000)) del += (await db.collection('questiontranslations').deleteMany({ questionId: { $in: c.map(oid) }, lang: 'hi' })).deletedCount;
  log(`CLEANUP deleted ${del} rows (rows without a canonical copy were kept; backup: ${BAK('questiontranslations')})`);
}

// Questions that repeat inside ONE test keep their own (old) embedded id, so they do not share the canonical Hindi row.
// Give each such copy its own Hindi row (a copy of the canonical one) so Hindi mode shows it too. Additive only.
async function stDupCopies() {
  const dups = []; for (const g of P.groups) for (const [old, test, , dup] of g.mem) if (dup) dups.push({ old, test, g });
  const ids = [...new Set(dups.flatMap(d => [d.old, d.g.newId]))];
  const rows = new Map();
  for (const c of chunks(ids, 5000)) for await (const r of db.collection('questiontranslations').find({ questionId: { $in: c.map(oid) }, lang: 'hi' }, { projection: { questionId: 1, questionText: 1, options: 1 } })) rows.set(String(r.questionId), r);
  const qn = new Map(); for (const c of chunks([...new Set(dups.map(d => d.g.newId))], 2000)) for await (const q of db.collection('questions').find({ _id: { $in: c.map(oid) } }, { projection: { options: 1 } })) qn.set(String(q._id), (q.options || []).length);
  let ownRow = 0, noCanonical = 0, optMismatch = 0; const todo = [];
  for (const d of dups) {
    if (rows.has(d.old)) { ownRow++; continue; }
    const src = rows.get(d.g.newId); if (!src) { noCanonical++; continue; }
    if (src.options.length !== qn.get(d.g.newId)) { optMismatch++; continue; }
    todo.push({ d, src });
  }
  log(`DUPCOPIES repeat-in-test copies ${dups.length}: already have own Hindi ${ownRow} | canonical has no Hindi (nothing to copy) ${noCanonical} | option-count mismatch ${optMismatch} | rows to add ${todo.length}`);
  if (!GO) { log('DUPCOPIES (dry) nothing written'); return; }
  if (optMismatch) throw new Error('option-count mismatch, refusing to write');
  const now = new Date();
  const ops = todo.map(({ d, src }) => ({ updateOne: { filter: { questionId: oid(d.old), lang: 'hi' }, update: { $setOnInsert: { questionId: oid(d.old), sourceType: 'test', sourceId: oid(d.test), lang: 'hi', questionText: src.questionText, options: src.options, model: MODEL_TAG, createdAt: now, updatedAt: now } }, upsert: true } }));
  let up = 0, ex = 0; for (const c of chunks(ops, 500)) { const r = await db.collection('questiontranslations').bulkWrite(c, { ordered: false }); up += r.upsertedCount; ex += r.matchedCount; }
  log(`DUPCOPIES upserted ${up}, already existed ${ex}`);
}

async function stVerify(S) {
  const retained = P.remapMembers.length === P.byOld.size ? 0 : P.byOld.size - P.remapMembers.length; // members deliberately left on their old id (same question twice in one test)
  const bad = Math.max(S.stateOld - retained, 0) + S.idMismatch + S.keyMismatch + S.missing;
  log(`VERIFY embedded: ids on new value ${S.stateNew}, still old ${S.stateOld} (of which ${retained} intentionally kept), mismatches ${S.idMismatch + S.keyMismatch + S.missing}`);
  let ok = 0, nokey = 0, nodoc = 0, active = 0;
  for (const c of chunks([...P.byNew.keys()], 4000)) {
    const found = new Map(); for await (const q of db.collection('questions').find({ _id: { $in: c.map(oid) } }, { projection: { questionText: 1, options: 1, image: 1, isActive: 1, source: 1 } })) found.set(String(q._id), q);
    for (const id of c) { const q = found.get(id), g = P.byNew.get(id); if (!q) { nodoc++; continue; } if (qDocKey(q) !== g.k) nokey++; else ok++; if (g.kind === 'new' && (q.isActive !== false || q.source !== SOURCE)) active++; }
  }
  log(`VERIFY canonical Question docs: content-equal ${ok}, content differs ${nokey}, missing ${nodoc}; new docs wrongly active/unmarked ${active}`);
  let have = 0, lack = 0; const oidsW = P.translationWrites.map(w => w.q);
  for (const c of chunks(oidsW, 5000)) have += await db.collection('questiontranslations').countDocuments({ questionId: { $in: c.map(oid) }, lang: 'hi' });
  lack = oidsW.length - have; log(`VERIFY translations: planned ${oidsW.length}, present ${have}${lack > 0 ? `, MISSING ${lack}` : ''}`);
  const oldSet = new Set(P.remapMembers.map(e => e.old)); let ansOld = 0;
  for await (const a of db.collection('usertestattempts').find({}, { projection: { 'answers.questionId': 1 } })) for (const x of a.answers || []) if (oldSet.has(String(x.questionId))) ansOld++;
  let rqOld = 0; for await (const r of db.collection('revisionqueues').find({ source: 'practice_test' }, { projection: { sourceQuestionId: 1 } })) if (oldSet.has(String(r.sourceQuestionId))) rqOld++;
  log(`VERIFY dependents still on old ids: attempt answers ${ansOld}, revision entries ${rqOld}  (both must be 0 after remap)`);
  log(`VERIFY RESULT: ${bad + nokey + nodoc + active + Math.max(lack, 0) + ansOld + rqOld === 0 ? 'ALL GOOD' : 'PROBLEMS FOUND (see above; before remap, "still old" is expected)'}`);
}

(async () => {
  if (!['check', 'backup', 'topics', 'questions', 'translations', 'remap', 'cleanup', 'verify', 'dupcopies'].includes(STAGE)) { console.log('usage: --stage=check|backup|topics|questions|translations|remap|cleanup|verify|dupcopies [--go] [--confirm-delete]'); process.exit(2); }
  await m.connect(uri); db = m.connection.db; client = m.connection.getClient();
  log(`stage=${STAGE} mode=${GO ? 'GO (WRITES)' : 'dry-run (read-only)'}`);
  await loadPlan();
  const needScan = ['check', 'questions', 'translations', 'remap', 'cleanup', 'verify'].includes(STAGE) && !(STAGE === 'cleanup' && !GO);
  const S = needScan ? await scanMembers({ content: STAGE === 'check' || STAGE === 'questions' }) : null;
  if (STAGE === 'check') {
    await stBackup(); await stTopics(); await stQuestions(S); await stTranslations(S); await stRemap(S); await stCleanup(S); await stVerify(S);
  } else await { backup: stBackup, topics: stTopics, questions: () => stQuestions(S), translations: () => stTranslations(S), remap: () => stRemap(S), cleanup: () => stCleanup(S), verify: () => stVerify(S), dupcopies: stDupCopies }[STAGE]();
  log('DONE'); process.exit(process.exitCode || 0);
})().catch(e => { console.error('ERR', e.stack || e.message); process.exit(1); });
