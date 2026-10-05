// Gives every question embedded in a PracticeTest / PYQ the id of ONE canonical `questions` document, so a question that
// appears in many tests (and in quizzes) shares a single id for translations, attempts, revision and discussions.
//
// For each embedded question it looks for an existing Question with the SAME content (strict key: text + question image +
// options IN ORDER with option images + correct index, so option order and selectedIndex never change) and reuses its _id;
// otherwise it creates a hidden Question (isActive:false, source:'practice_embedded') and uses that _id.
// Questions that cannot be mirrored (no subject for the section, invalid) keep their own id and are reported in `skipped`.
//
// Used by the PracticeTest model hooks and by scripts/mirrorTests.mjs. Keep it self-contained (mongoose + crypto only,
// no extensionless relative imports) so plain Node scripts can import it. Never throw into a caller's save path.
import mongoose from 'mongoose';
import crypto from 'crypto';

const SOURCE = 'practice_embedded'; // keep in sync with embeddedSource.js
const CREATED_BY_EMAIL = process.env.MIRROR_CREATED_BY_EMAIL || 'aajexam.com@gmail.com';
const SEP = '\u0003';
// section names whose subject is not an exact name match
const SUBJECT_ALIAS = [[/^paper ii\b/, 'paper ii'], [/^paper i\b/, 'paper i'], [/^तार्किक क्षमता$/, 'reasoning'], [/^आंकिक क्षमता$/, 'numerical ability']];

const ws = (x) => String(x == null ? '' : x).normalize('NFC').replace(/\s+/g, ' ').trim();
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');
const normSection = (s) => ws(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9ऀ-ॿ]+/g, ' ').trim();
const slugify = (s) => ws(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const toOid = (v) => (v instanceof mongoose.Types.ObjectId ? v : new mongoose.Types.ObjectId(String(v)));

// strict key of an embedded question (plain object or mongoose subdocument)
export function embeddedKey(q) {
    const opts = Array.from(q.options || []).map(ws);
    const imgs = Array.from(q.optionImages || []);
    const pairs = opts.map((o, i) => o + SEP + (imgs[i] || ''));
    return md5([ws(q.questionText), q.questionImage || '', pairs.join('\u0001'), q.correctAnswerIndex].join('\u0002'));
}

// the same key computed from a `questions` document
export function questionDocKey(d) {
    const opts = d.options || [];
    const ci = opts.findIndex((o) => o && o.isCorrect);
    const pairs = opts.map((o) => ws(o.text) + SEP + (o.image || ''));
    return md5([ws(d.questionText), d.image || '', pairs.join('\u0001'), ci].join('\u0002'));
}

let createdByCache = null;
async function getCreatedBy(db) {
    if (createdByCache) return createdByCache;
    const user = await db.collection('users').findOne({ email: CREATED_BY_EMAIL.toLowerCase() }, { projection: { _id: 1 } })
        || await db.collection('users').findOne({ email: { $regex: `^${CREATED_BY_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }, { projection: { _id: 1 } });
    if (user) createdByCache = user._id;
    return createdByCache;
}

// hidden topic "<Exam> – <Subject>" per (subject, exam); isActive:false so it never shows in any catalogue
async function ensureHiddenTopic(db, subjectId, name, dryRun) {
    const col = db.collection('topics');
    const found = await col.findOne({ subject: subjectId, name }, { projection: { _id: 1 } });
    if (found) return found._id;
    if (dryRun) return new mongoose.Types.ObjectId();
    const base = `${slugify(name)}-pyq-mock`;
    const now = new Date();
    for (let i = 0; i < 5; i += 1) {
        try {
            const r = await col.insertOne({ subject: subjectId, name, slug: i ? `${base}-${i + 1}` : base, description: '', exams: [], previousSlugs: [], isActive: false, order: 0, source: SOURCE, createdAt: now, updatedAt: now });
            return r.insertedId;
        } catch (err) {
            if (err.code !== 11000) throw err;
            const again = await col.findOne({ subject: subjectId, name }, { projection: { _id: 1 } });
            if (again) return again._id;
        }
    }
    throw new Error(`could not create hidden topic "${name}"`);
}

/**
 * Re-ids `questions` IN PLACE (plain objects or mongoose subdocuments). Returns a summary; never throws for content problems.
 * dryRun:true assigns ids to the questions but writes nothing (new ids are generated, not inserted).
 */
export async function mirrorQuestionsInPlace(questions, { examPatternId, dryRun = false } = {}) {
    const out = { total: 0, unchanged: 0, reused: 0, created: 0, keptDuplicateInTest: 0, skipped: [], linkedIdx: [] };
    const list = Array.from(questions || []);
    out.total = list.length;
    if (!list.length || !examPatternId) return out;
    const db = mongoose.connection.db;

    const pattern = await db.collection('exampatterns').findOne({ _id: toOid(examPatternId) }, { projection: { exam: 1 } });
    if (!pattern || !pattern.exam) { out.skipped.push({ reason: 'exam pattern has no exam' }); return out; }
    const exam = await db.collection('exams').findOne({ _id: pattern.exam }, { projection: { name: 1 } });

    // one entry per distinct question of this test; a repeat inside the same test keeps its own id (answers are keyed by id)
    const items = []; const seen = new Set();
    list.forEach((q, idx) => {
        const opts = Array.from(q.options || []);
        if (!ws(q.questionText) || opts.length < 2 || !opts[q.correctAnswerIndex]) { out.skipped.push({ idx, reason: 'invalid question' }); return; }
        const key = embeddedKey(q);
        if (seen.has(key)) { out.keptDuplicateInTest += 1; return; }
        seen.add(key);
        items.push({ q, idx, key });
    });
    if (!items.length) return out;

    // candidates: existing Question docs with the same text (quiz questions and earlier hidden mirrors alike)
    const texts = [...new Set(items.flatMap((it) => [String(it.q.questionText).trim(), ws(it.q.questionText)]))];
    const cands = new Map();
    const raw = await db.collection('questions').find({ questionText: { $in: texts } }, { projection: { questionText: 1, options: 1, image: 1, isActive: 1, createdAt: 1, explanation: 1 } }).toArray();
    for (const d of raw) {
        if ((d.options || []).filter((o) => o && o.isCorrect).length !== 1) continue;
        const k = questionDocKey(d);
        (cands.get(k) || cands.set(k, []).get(k)).push({ id: String(d._id), active: d.isActive !== false, at: d.createdAt ? +new Date(d.createdAt) : 0, expl: ws(d.explanation) });
    }

    // when several identical Question docs exist, prefer the one that already has a stored translation
    const ambiguous = [...cands.values()].filter((c) => c.length > 1).flat().map((x) => x.id);
    const translated = new Set();
    if (ambiguous.length) {
        const rows = await db.collection('questiontranslations').find({ questionId: { $in: ambiguous.map(toOid) } }, { projection: { questionId: 1 } }).toArray();
        rows.forEach((r) => translated.add(String(r.questionId)));
    }

    const toCreate = []; const explUpdates = [];
    for (const it of items) {
        const c = cands.get(it.key) || [];
        const cur = String(it.q._id || '');
        let pick = c.find((x) => x.id === cur); // keep the id it already has when that doc still matches
        if (!pick && c.length) {
            pick = [...c].sort((a, b) => (Number(translated.has(b.id)) - Number(translated.has(a.id))) || (Number(b.active) - Number(a.active)) || (a.at - b.at))[0];
        }
        if (!pick) { toCreate.push(it); continue; }
        // `questions` is the source of truth: a different explanation entered on the test is written to the shared document
        if (ws(it.q.explanation) && ws(it.q.explanation) !== pick.expl) explUpdates.push({ id: pick.id, explanation: String(it.q.explanation).trim() });
        out.linkedIdx.push(it.idx);
        if (pick.id === cur) out.unchanged += 1;
        else { it.q._id = toOid(pick.id); out.reused += 1; }
    }
    if (!dryRun && explUpdates.length) await db.collection('questions').bulkWrite(explUpdates.map((u) => ({ updateOne: { filter: { _id: toOid(u.id) }, update: { $set: { explanation: u.explanation, updatedAt: new Date() } } } })), { ordered: false });
    out.explanationUpdated = explUpdates.length;
    if (!toCreate.length) return out;

    // subject per section; without one a Question cannot be created, so the embedded question keeps its own id
    const subjects = await db.collection('subjects').find({}, { projection: { name: 1, mergedInto: 1 } }).toArray();
    const byId = new Map(subjects.map((s) => [String(s._id), s]));
    const byNorm = new Map();
    for (const s of subjects) if (!s.mergedInto && !byNorm.has(normSection(s.name))) byNorm.set(normSection(s.name), s);
    const resolve = (s) => { let n = 0; let cur = s; while (cur && cur.mergedInto && n < 5) { cur = byId.get(String(cur.mergedInto)) || cur; n += 1; } return cur; };
    const createdBy = await getCreatedBy(db);
    if (!createdBy) { toCreate.forEach((it) => out.skipped.push({ idx: it.idx, reason: `no user ${CREATED_BY_EMAIL} to own new questions` })); return out; }

    const docs = []; const topicCache = new Map(); const now = new Date();
    for (const it of toCreate) {
        const section = normSection(it.q.section);
        let subject = byNorm.get(section);
        if (!subject) for (const [re, name] of SUBJECT_ALIAS) if (re.test(section)) { subject = byNorm.get(name); break; }
        subject = subject && resolve(subject);
        if (!subject) { out.skipped.push({ idx: it.idx, reason: `no subject for section "${ws(it.q.section)}"` }); continue; }
        const topicName = `${exam ? exam.name : 'Unknown exam'} – ${subject.name}`;
        const tk = `${subject._id}|${topicName}`;
        if (!topicCache.has(tk)) topicCache.set(tk, await ensureHiddenTopic(db, subject._id, topicName, dryRun));
        const opts = Array.from(it.q.options).map((o) => String(o).trim());
        const imgs = Array.from(it.q.optionImages || []);
        const text = String(it.q.questionText).trim();
        const _id = new mongoose.Types.ObjectId();
        docs.push({
            _id, exam: pattern.exam, subject: subject._id, topic: topicCache.get(tk), questionText: text,
            options: opts.map((o, i) => ({ text: o, isCorrect: i === it.q.correctAnswerIndex, image: imgs[i] || '' })),
            explanation: ws(it.q.explanation) ? String(it.q.explanation).trim() : '',
            difficulty: ['easy', 'medium', 'hard'].includes(it.q.difficulty) ? it.q.difficulty : 'medium',
            tags: Array.from(it.q.tags || []).map((t) => String(t).trim().toLowerCase()).filter(Boolean),
            language: /[ऀ-ॿ]/.test(text) ? 'hi' : 'en', image: it.q.questionImage || '',
            isActive: false, source: SOURCE, createdBy, createdAt: now, updatedAt: now,
        });
        it.q._id = _id;
        out.linkedIdx.push(it.idx);
        out.created += 1;
    }
    if (!dryRun && docs.length) await db.collection('questions').insertMany(docs, { ordered: false });
    return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// Content now lives ONLY in `questions`. A test element keeps just its link (`_id` = the Question _id) and the test-specific
// `section` (plus explanationImage, which `questions` has no field for). These are the fields removed from a linked element.
export const CONTENT_FIELDS = ['questionText', 'questionImage', 'options', 'optionImages', 'correctAnswerIndex', 'explanation', 'tags', 'difficulty'];
const hasContent = (q) => !!ws(q && q.questionText) && Array.from((q && q.options) || []).length >= 2;
const stripContent = (q) => { if (typeof q.set === 'function') CONTENT_FIELDS.forEach((f) => q.set(f, undefined)); else CONTENT_FIELDS.forEach((f) => { delete q[f]; }); };

/**
 * Store-time normalisation of a test's questions, IN PLACE, used by the PracticeTest model hooks:
 *  1. an element whose _id already is a `questions` document is that question. If the admin changed its content the shared
 *     document is UPDATED IN PLACE (one source of truth for quizzes, tests and PYQs) and its stored translations are deleted
 *     because they belong to the old text;
 *  2. any other element with content is matched to an identical document or gets a new hidden one (mirrorQuestionsInPlace);
 *  3. every linked element then drops its content fields, keeping only `_id` + `section`.
 * An element that could not be linked (a repeat inside the same test, an invalid question, no subject for its section) keeps
 * its content untouched, and a link-only element (no content) is left as it is. dryRun writes nothing and strips nothing.
 */
export async function linkAndCompactQuestions(questions, { examPatternId, dryRun = false } = {}) {
    const list = Array.from(questions || []);
    const out = { total: list.length, linkOnly: 0, unchanged: 0, edited: 0, reused: 0, created: 0, compacted: 0, keptWithContent: 0, explanationUpdated: 0, skipped: [] };
    if (!list.length) return out;
    const db = mongoose.connection.db;
    const withContent = list.map((q, idx) => ({ q, idx })).filter(({ q }) => hasContent(q));
    out.linkOnly = list.length - withContent.length;
    if (!withContent.length) return out;

    const linked = new Set(); const rest = []; const writes = []; const dropTranslations = [];
    const wantIds = withContent.map(({ q }) => String(q._id || '')).filter((x) => /^[0-9a-f]{24}$/i.test(x));
    const docs = new Map();
    if (wantIds.length) {
        const found = await db.collection('questions').find({ _id: { $in: wantIds.map(toOid) } }, { projection: { questionText: 1, options: 1, image: 1, explanation: 1 } }).toArray();
        found.forEach((d) => docs.set(String(d._id), d));
    }
    for (const it of withContent) {
        const d = docs.get(String(it.q._id || ''));
        if (!d) { rest.push(it); continue; }
        const opts = Array.from(it.q.options).map((o) => String(o).trim());
        const imgs = Array.from(it.q.optionImages || []);
        const set = {};
        if (embeddedKey(it.q) === questionDocKey(d)) out.unchanged += 1;
        else if (!opts[it.q.correctAnswerIndex]) { out.skipped.push({ idx: it.idx, reason: 'edited question has no valid correct option' }); continue; }
        else {
            set.questionText = String(it.q.questionText).trim();
            set.options = opts.map((o, i) => ({ text: o, isCorrect: i === it.q.correctAnswerIndex, image: imgs[i] || '' }));
            set.image = it.q.questionImage || '';
            out.edited += 1; dropTranslations.push(d._id);
        }
        const expl = ws(it.q.explanation);
        if (expl && expl !== ws(d.explanation)) { set.explanation = String(it.q.explanation).trim(); out.explanationUpdated += 1; }
        if (Object.keys(set).length) writes.push({ updateOne: { filter: { _id: d._id }, update: { $set: { ...set, updatedAt: new Date() } } } });
        linked.add(it.idx);
    }
    if (!dryRun && writes.length) await db.collection('questions').bulkWrite(writes, { ordered: false });
    if (!dryRun && dropTranslations.length) await db.collection('questiontranslations').deleteMany({ questionId: { $in: dropTranslations } });

    if (rest.length) {
        const res = await mirrorQuestionsInPlace(rest.map((r) => r.q), { examPatternId, dryRun });
        out.reused += res.reused + res.unchanged; out.created += res.created;
        out.explanationUpdated += res.explanationUpdated || 0;
        out.skipped.push(...res.skipped.map((x) => ({ ...x, idx: x.idx === undefined ? undefined : rest[x.idx].idx })));
        res.linkedIdx.forEach((i) => linked.add(rest[i].idx));
    }
    for (const idx of linked) { if (!dryRun) stripContent(list[idx]); out.compacted += 1; }
    out.keptWithContent = withContent.length - linked.size;
    return out;
}

/**
 * Daily challenge entries: a custom question whose content (text, options in order, correct option) is identical to a document in
 * `questions` becomes a link (`question`) and drops its copy. Anything without an identical document keeps its content: no
 * document is created here (a daily challenge has no exam pattern / section to place a new question under).
 * An entry carrying a different explanation than the document keeps its content too, so nothing the admin wrote is lost.
 */
export async function linkDailyChallengeQuestions(questions, { dryRun = false } = {}) {
    const list = Array.from(questions || []);
    const out = { total: list.length, linked: 0, kept: 0 };
    const items = list.filter((q) => q && !q.question && ws(q.questionText) && Array.from(q.options || []).length >= 2);
    if (!items.length) return out;
    const db = mongoose.connection.db;
    const texts = [...new Set(items.flatMap((q) => [String(q.questionText).trim(), ws(q.questionText)]))];
    const raw = await db.collection('questions').find({ questionText: { $in: texts } }, { projection: { questionText: 1, options: 1, image: 1, isActive: 1, createdAt: 1, explanation: 1 } }).toArray();
    const byKey = new Map();
    for (const d of raw) {
        if ((d.options || []).filter((o) => o && o.isCorrect).length !== 1) continue;
        const k = questionDocKey(d); (byKey.get(k) || byKey.set(k, []).get(k)).push(d);
    }
    for (const q of items) {
        const opts = Array.from(q.options);
        const correct = opts.filter((o) => o && o.isCorrect);
        if (correct.length !== 1) { out.kept += 1; continue; }
        const key = embeddedKey({ questionText: q.questionText, questionImage: '', options: opts.map((o) => o.text), optionImages: [], correctAnswerIndex: opts.findIndex((o) => o && o.isCorrect) });
        const found = byKey.get(key);
        if (!found || !found.length) { out.kept += 1; continue; }
        const d = [...found].sort((a, b) => (Number(b.isActive !== false) - Number(a.isActive !== false)) || (+new Date(a.createdAt || 0) - +new Date(b.createdAt || 0)))[0];
        const expl = ws(q.explanation);
        if (expl && expl !== ws(d.explanation)) { out.kept += 1; continue; }
        out.linked += 1;
        if (dryRun) continue;
        q.question = d._id;
        if (typeof q.set === 'function') { q.set('questionText', undefined); q.set('options', undefined); q.set('explanation', undefined); }
        else { delete q.questionText; delete q.options; delete q.explanation; }
    }
    return out;
}
