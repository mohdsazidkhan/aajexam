// READ-ONLY dry run v3 (Option A): embedded practice-test/PYQ question _id becomes the canonical Question _id.
// STRICT merge key = text + question image + options IN ORDER (with option images) + correct index, so option order / selectedIndex never change.
// Writes only local files: migr_plan_v3.json, migr_summary_v3.json, migr_samples_v3.txt. Never writes to the DB.
// run: node --max-old-space-size=6144 migr_dry3.js
const fs = require('fs');
const crypto = require('crypto');
const m = require('D:/Sazid/Github/aajexam/node_modules/mongoose');
const env = fs.readFileSync('D:/Sazid/Github/aajexam/.env.local', 'utf8');
const uri = env.match(/^MONGO_URI=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '');
const OUT = 'D:/Sazid/Github/aajexam/scripts/migration';
const CREATED_BY_EMAIL = 'aajexam.com@gmail.com';
const T0 = Date.now();
const log = s => console.log(`[${String(Math.round((Date.now() - T0) / 1000)).padStart(5)}s] ${s}`);
const ws = x => String(x == null ? '' : x).normalize('NFC').replace(/\s+/g, ' ').trim();
const H = s => crypto.createHash('md5').update(s).digest('hex');
const SEP = '\u0003';
const digits = s => (String(s || '').replace(/[\u0966-\u096F]/g, c => String(c.charCodeAt(0) - 0x0966)).match(/\d+/g) || []).sort().join(',');
const normS = s => ws(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9\u0900-\u097f]+/g, ' ').trim();
const pick = (arr, v, n) => { if (arr.length < n) arr.push(v); };
const M = {}; const samples = { dupTest: [], rqCollision: [], noSubject: [], diffMix: [] };

(async () => {
  await m.connect(uri);
  const db = m.connection.db;

  // ---------- environment checks ----------
  const hello = await db.admin().command({ hello: 1 });
  M.deployment = { setName: hello.setName || null, isWritablePrimary: hello.isWritablePrimary, maxWireVersion: hello.maxWireVersion, logicalSessionTimeoutMinutes: hello.logicalSessionTimeoutMinutes || null };
  let txnOk = false, txnErr = null;
  try { const s = m.connection.getClient().startSession(); s.startTransaction(); await db.collection('exams').findOne({}, { session: s }); await s.abortTransaction(); await s.endSession(); txnOk = true; } catch (e) { txnErr = e.message; }
  M.transactions = { supported: txnOk, error: txnErr };
  log('DEPLOYMENT ' + JSON.stringify(M.deployment) + ' TRANSACTIONS ' + JSON.stringify(M.transactions));

  const user = await db.collection('users').findOne({ email: { $regex: '^' + CREATED_BY_EMAIL.replace('.', '\\.') + '$', $options: 'i' } }, { projection: { email: 1, role: 1, name: 1 } });
  M.createdBy = user ? { id: String(user._id), email: user.email, role: user.role || null, name: user.name || null } : null;
  log('CREATEDBY ' + JSON.stringify(M.createdBy));

  // ---------- reference data ----------
  const examName = new Map(); for await (const e of db.collection('exams').find({}, { projection: { name: 1 } })) examName.set(String(e._id), e.name);
  const patExam = new Map(); for await (const p of db.collection('exampatterns').find({}, { projection: { exam: 1 } })) patExam.set(String(p._id), String(p.exam));
  const subjects = await db.collection('subjects').find({}, { projection: { name: 1, mergedInto: 1 } }).toArray();
  const subjById = new Map(subjects.map(s => [String(s._id), s]));
  const resolveSubj = s => { let n = 0; while (s && s.mergedInto && n++ < 5) s = subjById.get(String(s.mergedInto)) || s; return s; };
  const subjByNorm = new Map(); for (const s of subjects) { if (s.mergedInto) continue; if (!subjByNorm.has(normS(s.name))) subjByNorm.set(normS(s.name), s); }
  const topicByKey = new Map(); for await (const t of db.collection('topics').find({}, { projection: { subject: 1, name: 1 } })) topicByKey.set(String(t.subject) + '|' + t.name, String(t._id));
  log(`exams ${examName.size}, patterns ${patExam.size}, subjects ${subjects.length}, topics ${topicByKey.size}`);

  // ---------- translations: all languages ----------
  const trByLang = {}; const trAll = new Map(); // id -> Map(lang -> row)
  for await (const t of db.collection('questiontranslations').find({}, { projection: { questionId: 1, lang: 1, questionText: 1, options: 1, createdAt: 1 } })) {
    trByLang[t.lang] = (trByLang[t.lang] || 0) + 1;
    const id = String(t.questionId); const mp = trAll.get(id) || trAll.set(id, new Map()).get(id);
    mp.set(t.lang, { t: t.questionText || '', o: t.options || [], at: t.createdAt ? +new Date(t.createdAt) : 0 });
  }
  M.translationRowsByLang = trByLang; log('translation rows by lang ' + JSON.stringify(trByLang));

  // ---------- existing quiz questions: strict key (no images) ----------
  const exist = new Map(); let qTotal = 0, qSkipped = 0;
  for await (const q of db.collection('questions').find({}, { projection: { questionText: 1, options: 1, image: 1, isActive: 1, createdAt: 1 } })) {
    qTotal++; const opts = q.options || []; const ci = opts.findIndex(o => o && o.isCorrect);
    if (q.image || ci < 0 || opts.filter(o => o && o.isCorrect).length !== 1) { qSkipped++; continue; }
    const pairs = opts.map(o => ws(o.text) + SEP);
    const key = H([ws(q.questionText), '', pairs.join('\u0001'), ci].join('\u0002'));
    (exist.get(key) || exist.set(key, []).get(key)).push({ id: String(q._id), active: q.isActive !== false, at: q.createdAt ? +new Date(q.createdAt) : 0 });
  }
  log(`questions ${qTotal} (not indexable ${qSkipped}); strict keys ${exist.size}`);

  // ---------- embedded pass ----------
  const recs = []; const groups = new Map(); const byId = new Map();
  const occ = { pyq: 0, test: 0 }; let invalid = 0; const testIds = new Set(); let testCount = 0, dupTests = 0, dupElems = 0, mixedDiff = 0;
  const cur = db.collection('practicetests').find({}, { projection: { isPYQ: 1, examPattern: 1, 'questions._id': 1, 'questions.questionText': 1, 'questions.questionImage': 1, 'questions.options': 1, 'questions.optionImages': 1, 'questions.correctAnswerIndex': 1, 'questions.section': 1, 'questions.explanation': 1, 'questions.explanationImage': 1, 'questions.tags': 1, 'questions.difficulty': 1 } });
  for await (const t of cur) {
    testCount++; const kind = t.isPYQ ? 'pyq' : 'test'; const exam = patExam.get(String(t.examPattern)) || '';
    const seenInTest = new Map(); let testHasDup = false; testIds.add(String(t._id));
    (t.questions || []).forEach((q, idx) => {
      occ[kind]++;
      const opts = (q.options || []).map(ws); const imgs = q.optionImages || [];
      const pairs = opts.map((o, i) => o + SEP + (imgs[i] || '')); const ci = q.correctAnswerIndex;
      const id = String(q._id); const text = ws(q.questionText);
      const rec = { id, test: String(t._id), idx, kind, exam, section: ws(q.section), text, nOpts: opts.length, img: !!(q.questionImage || imgs.some(Boolean)), optImg: imgs.some(Boolean), expl: !!ws(q.explanation), diff: q.difficulty || 'medium' };
      byId.set(id, rec); recs.push(rec);
      if (!pairs[ci] || !text || opts.length < 2) { invalid++; rec.invalid = true; return; }
      if (rec.diff === 'mixed') mixedDiff++;
      rec.key = H([text, q.questionImage || '', pairs.join('\u0001'), ci].join('\u0002'));
      let g = groups.get(rec.key); if (!g) { g = { key: rec.key, members: [], pairs, ci, img: rec.img, optImg: rec.optImg }; groups.set(rec.key, g); }
      if (seenInTest.has(rec.key)) { rec.dupKeep = true; dupElems++; testHasDup = true; pick(samples.dupTest, `test ${t._id} idx ${seenInTest.get(rec.key)} & ${idx}: ${text.slice(0, 70)}`, 15); }
      else seenInTest.set(rec.key, idx);
      g.members.push(rec);
    });
    if (testHasDup) dupTests++;
    if (testCount % 200 === 0) log(`tests scanned ${testCount}`);
  }
  const total = occ.pyq + occ.test;
  M.embedded = { tests: testCount, pyq: occ.pyq, practice: occ.test, total, invalid, strictGroups: groups.size, exactDuplicatesRemoved: total - invalid - groups.size, mixedDifficultyMembers: mixedDiff };
  M.intraTestDuplicates = { testsAffected: dupTests, embeddedElementsKeepingOldId: dupElems };
  log('EMBEDDED ' + JSON.stringify(M.embedded) + ' INTRA-TEST DUPS ' + JSON.stringify(M.intraTestDuplicates));

  // ---------- group -> canonical target ----------
  let nExisting = 0, nNew = 0, nMulti = 0, imgGroups = 0, optImgGroups = 0;
  for (const g of groups.values()) {
    if (g.img) imgGroups++; if (g.optImg) optImgGroups++;
    const cands = !g.img ? (exist.get(g.key) || []) : [];
    if (cands.length) {
      if (cands.length > 1) nMulti++;
      cands.sort((a, b) => ((trAll.has(b.id) ? 1 : 0) - (trAll.has(a.id) ? 1 : 0)) || (b.active - a.active) || (a.at - b.at));
      g.kind = 'existing'; g.newId = cands[0].id; nExisting++;
    } else { g.kind = 'new'; g.newId = String(new m.Types.ObjectId()); nNew++; }
  }
  M.groups = { existing: nExisting, new: nNew, existingWithMultipleCandidateDocs: nMulti, imageGroups: imgGroups, optionImageGroups: optImgGroups };
  M.occurrences = { linkedToExisting: 0, linkedToNew: 0 };
  for (const g of groups.values()) M.occurrences[g.kind === 'existing' ? 'linkedToExisting' : 'linkedToNew'] += g.members.length;
  log('GROUPS ' + JSON.stringify(M.groups) + ' OCCURRENCES ' + JSON.stringify(M.occurrences));

  // ---------- id map (oldId -> newId), invariants ----------
  const idmap = new Map(); let retained = 0, remapped = 0, identical = 0;
  for (const g of groups.values()) for (const r of g.members) {
    if (r.dupKeep) { retained++; continue; }
    idmap.set(r.id, g.newId); remapped++; if (r.id === g.newId) identical++;
  }
  // an id that is the new id of one group but currently the OLD id of a different embedded question would be a clash
  const newIdSet = new Map(); for (const g of groups.values()) newIdSet.set(g.newId, g.key);
  let clash = 0; for (const r of recs) { const k = newIdSet.get(r.id); if (k && (r.invalid || r.dupKeep || r.key !== k)) clash++; }
  M.idmap = { remapped, alreadyIdentical: identical, retainedOldId: retained, invalidSkipped: invalid, newIdClashWithOtherEmbeddedId: clash };
  log('IDMAP ' + JSON.stringify(M.idmap));

  // ---------- NEW docs: exam / subject / topic ----------
  const SUBJ_ALIAS = [[/^paper ii\b/, 'paper ii'], [/^paper i\b/, 'paper i'], [/^तार्किक क्षमता$/, 'reasoning']];
  const topicsNeeded = new Map(); const examSpread = {}; let noSubject = 0, withExpl = 0;
  const secUnmatched = new Map();
  for (const g of groups.values()) {
    if (g.kind !== 'new') continue;
    const cnt = f => { const c = new Map(); for (const r of g.members) c.set(f(r), (c.get(f(r)) || 0) + 1); return [...c.entries()].sort((a, b) => b[1] - a[1]); };
    const exs = cnt(r => r.exam); g.exam = exs[0][0]; examSpread[Math.min(exs.length, 5)] = (examSpread[Math.min(exs.length, 5)] || 0) + 1;
    g.section = cnt(r => r.section)[0][0];
    let s = subjByNorm.get(normS(g.section));
    if (!s) for (const [re, nm] of SUBJ_ALIAS) if (re.test(normS(g.section)) || re.test(g.section)) { s = subjByNorm.get(nm); break; }
    if (!s) { noSubject++; secUnmatched.set(g.section, (secUnmatched.get(g.section) || 0) + 1); g.subject = null; continue; }
    s = resolveSubj(s); g.subject = String(s._id); g.subjectName = s.name;
    g.topicName = `${examName.get(g.exam) || 'Unknown exam'} \u2013 ${s.name}`;
    const tk = g.subject + '|' + g.topicName; g.topicExisting = topicByKey.get(tk) || null;
    topicsNeeded.set(tk, (topicsNeeded.get(tk) || 0) + 1);
    if (g.members.some(r => r.expl)) withExpl++;
  }
  const topicsToCreate = [...topicsNeeded.keys()].filter(k => !topicByKey.has(k)).length;
  M.newDocs = { count: nNew, examsPerGroupSpread: examSpread, noSubjectResolved: noSubject, unmatchedSections: [...secUnmatched.entries()], distinctTopicsUsed: topicsNeeded.size, topicsAlreadyExisting: topicsNeeded.size - topicsToCreate, topicsToCreate, withExplanation: withExpl, withAnyImage: [...groups.values()].filter(g => g.kind === 'new' && g.img).length, withOptionImages: [...groups.values()].filter(g => g.kind === 'new' && g.optImg).length };
  log('NEW DOCS ' + JSON.stringify(M.newDocs));

  // ---------- translations (per language) ----------
  const tr = { groupsWithCandidate: 0, rowsToWrite: 0, existingTargetKept: 0, skippedAllSuspect: 0, optionCountMismatch: 0, conflictGroups: 0, oldRowsRekeyed: 0, oldRowsNotCarried: 0, oldRowsOnRetainedIds: 0, byLangWrite: {} };
  const writes = [];
  for (const g of groups.values()) {
    const langs = new Set();
    for (const r of g.members) { const mp = trAll.get(r.id); if (mp) for (const l of mp.keys()) langs.add(l); }
    const tmap = g.kind === 'existing' ? trAll.get(g.newId) : null; if (tmap) for (const l of tmap.keys()) langs.add(l);
    for (const l of langs) {
      const cands = []; const nOpt = g.pairs.length;
      for (const r of g.members) { const h = trAll.get(r.id)?.get(l); if (!h) continue; if (r.dupKeep) { tr.oldRowsOnRetainedIds++; } else tr.oldRowsRekeyed++; if (h.o.length !== nOpt) { tr.optionCountMismatch++; continue; } cands.push({ ...h, suspect: digits(r.text) !== digits(h.t), v: H(h.t + '\u0001' + h.o.join('\u0002')), rid: r.id }); }
      const ex = tmap && tmap.get(l);
      if (ex) { tr.existingTargetKept++; continue; } // existing canonical row stays; never overwritten
      if (!cands.length) continue; tr.groupsWithCandidate++;
      const byV = new Map(); for (const c of cands) (byV.get(c.v) || byV.set(c.v, []).get(c.v)).push(c);
      const variants = [...byV.values()].map(a => ({ a, n: a.length, ok: a.some(c => !c.suspect), at: Math.max(...a.map(c => c.at)) })).sort((x, y) => (y.ok - x.ok) || (y.n - x.n) || (y.at - x.at));
      if (variants.length > 1) tr.conflictGroups++;
      const win = variants[0];
      if (!win.ok) { tr.skippedAllSuspect++; continue; }
      tr.rowsToWrite++; tr.byLangWrite[l] = (tr.byLangWrite[l] || 0) + 1;
      writes.push({ q: g.newId, l, src: win.a[0].rid });
    }
  }
  // rows whose Hindi is not carried into a canonical row = rekeyed rows - rows reflecting a written/kept canonical row (informational upper bound)
  tr.oldRowsNotCarried = tr.oldRowsRekeyed - writes.length;
  M.translation = tr; log('TRANSLATION ' + JSON.stringify(tr));

  // ---------- dependents: attempts + revision queue ----------
  const att = { attempts: 0, inProgress: 0, inProgressLast24h: 0, inProgressLast7d: 0, answersTotal: 0, answersRemapped: 0, answersOnRetainedIds: 0, answersOnInvalidIds: 0, answersNotEmbedded: 0, attemptsWithCollision: 0, attemptsTouched: 0 };
  const now = Date.now();
  for await (const a of db.collection('usertestattempts').find({}, { projection: { status: 1, updatedAt: 1, 'answers.questionId': 1 } })) {
    att.attempts++; if (a.status === 'InProgress') { att.inProgress++; const age = now - +new Date(a.updatedAt || 0); if (age < 864e5) att.inProgressLast24h++; if (age < 7 * 864e5) att.inProgressLast7d++; }
    const seen = new Set(); let touched = false, coll = false;
    for (const x of a.answers || []) {
      att.answersTotal++; const id = String(x.questionId); const r = byId.get(id);
      if (!r) { att.answersNotEmbedded++; continue; }
      if (r.invalid) { att.answersOnInvalidIds++; continue; }
      if (r.dupKeep) { att.answersOnRetainedIds++; continue; }
      att.answersRemapped++; touched = true; const nid = idmap.get(id); if (seen.has(nid)) coll = true; seen.add(nid);
    }
    if (touched) att.attemptsTouched++; if (coll) att.attemptsWithCollision++;
  }
  M.attempts = att; log('ATTEMPTS ' + JSON.stringify(att));

  const rq = { total: 0, practiceTestEntries: 0, pointingToEmbedded: 0, toRemap: 0, onRetained: 0, uniqueKeyCollisions: 0, collisionEntriesLost: 0, alreadyHaveRef: 0 };
  const rqKey = new Map();
  for await (const e of db.collection('revisionqueues').find({}, { projection: { user: 1, source: 1, sourceId: 1, sourceQuestionId: 1, questionRef: 1 } })) {
    rq.total++; if (e.source === 'practice_test') rq.practiceTestEntries++;
    const id = String(e.sourceQuestionId); const r = byId.get(id);
    if (!r || e.source !== 'practice_test') { if (r) rq.pointingToEmbedded++; continue; }
    rq.pointingToEmbedded++; if (e.questionRef) rq.alreadyHaveRef++;
    if (r.invalid || r.dupKeep) { rq.onRetained++; continue; }
    rq.toRemap++; const nid = idmap.get(id); const k = `${e.user}|${e.source}|${nid}`;
    const prev = rqKey.get(k); if (prev) { rq.uniqueKeyCollisions++; pick(samples.rqCollision, `user ${e.user} q ${nid}: ${prev} & ${e._id}`, 10); } else rqKey.set(k, String(e._id));
  }
  // collisions with entries that ALREADY use the canonical id under the same (user, source)
  rq.collisionEntriesLost = rq.uniqueKeyCollisions;
  M.revisionQueue = rq; log('REVISIONQUEUE ' + JSON.stringify(rq));

  // ---------- write plan / summary / samples ----------
  const plan = [...groups.values()].map(g => ({ k: g.key, kind: g.kind, newId: g.newId, mem: g.members.map(r => [r.id, r.test, r.idx, r.dupKeep ? 1 : 0]), exam: g.exam || null, section: g.section || null, subject: g.subject || null, topic: g.topicName || null, topicId: g.topicExisting || null, img: g.img }));
  fs.writeFileSync(OUT + '/migr_plan_v3.json', JSON.stringify({ createdBy: M.createdBy, invalid: recs.filter(r => r.invalid).map(r => [r.id, r.test, r.idx]), groups: plan, translationWrites: writes }));
  fs.writeFileSync(OUT + '/migr_summary_v3.json', JSON.stringify(M, null, 2));
  fs.writeFileSync(OUT + '/migr_samples_v3.txt', ['=== INTRA-TEST DUPLICATES ===', ...samples.dupTest, '', '=== REVISION QUEUE UNIQUE-KEY COLLISIONS ===', ...samples.rqCollision, '', '=== UNMATCHED SECTIONS ===', ...[...secUnmatched.entries()].map(x => x.join(' = '))].join('\n'));
  log('plan written: ' + plan.length + ' groups, ' + writes.length + ' translation writes');
  log('DONE');
  process.exit(0);
})().catch(e => { console.error('ERR', e.stack || e.message); process.exit(1); });
