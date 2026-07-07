/**
 * For each exam that currently has EXACTLY ONE (non-PYQ) Practice Test, add a
 * SECOND one ("<Exam> – Practice Test - 2"), composed from the exam's PYQ
 * questions UNION the questions already in its first Practice Test — matching
 * the pattern's section structure. Prefers questions NOT used in Test-1 so the
 * new paper is genuinely different (falls back to reuse only if the pool is
 * too small to fill a section). Reuses verified content — no fabrication.
 *
 * Idempotent: skips exams that don't have exactly 1 non-PYQ test, or that
 * already have a "Practice Test - 2".
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __d = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__d, '../.env.local') });
dotenv.config({ path: path.resolve(__d, '../.env') });

const Exam = mongoose.models.Exam || mongoose.model('Exam', new mongoose.Schema({}, { strict: false }));
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', new mongoose.Schema({}, { strict: false }));
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', new mongoose.Schema({}, { strict: false }));

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function stamp() { const d = new Date(); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; }
const qkey = q => (q.questionText || '') + '|' + (q.questionImage || '');

await mongoose.connect(process.env.MONGO_URI);
console.log('Connected.');
const DRY = process.argv.includes('--dry');

const patterns = await ExamPattern.find({}).lean();
const patById = new Map(patterns.map(p => [String(p._id), p]));
const exams = await Exam.find({}).lean();
const tests = await PracticeTest.find({}).lean();

// group tests per exam
const byExam = new Map();
for (const t of tests) {
  const pat = patById.get(String(t.examPattern)); if (!pat) continue;
  const exId = String(pat.exam);
  if (!byExam.has(exId)) byExam.set(exId, { pyqByPattern: new Map(), nonPyq: [] });
  const rec = byExam.get(exId);
  if (t.isPYQ) {
    if (!rec.pyqByPattern.has(String(t.examPattern))) rec.pyqByPattern.set(String(t.examPattern), []);
    rec.pyqByPattern.get(String(t.examPattern)).push(t);
  } else rec.nonPyq.push(t);
}

let created = 0, skipped = 0;
for (const ex of exams) {
  const rec = byExam.get(String(ex._id));
  if (!rec) continue;
  if (rec.nonPyq.length !== 1) { skipped++; continue; }          // only exams with a SINGLE practice test
  if (rec.pyqByPattern.size === 0) { skipped++; continue; }        // need PYQs to compose from
  if (rec.nonPyq.some(t => /Practice Test - 2\b/.test(t.title))) { skipped++; continue; }

  const existing = rec.nonPyq[0];
  // primary pattern = the one whose PYQ tests hold the most questions
  let bestPat = null, bestTests = null, bestQ = -1;
  for (const [patId, ts] of rec.pyqByPattern) {
    const q = ts.reduce((s, t) => s + (t.questions || []).length, 0);
    if (q > bestQ) { bestQ = q; bestPat = patById.get(patId); bestTests = ts; }
  }
  // pool = PYQ questions (under chosen pattern) UNION existing Practice-Test-1 questions
  const pool = [];
  for (const t of bestTests) for (const q of (t.questions || []))
    if ((q.questionText && q.questionText.trim()) || q.questionImage) pool.push(q);
  for (const q of (existing.questions || []))
    if ((q.questionText && q.questionText.trim()) || q.questionImage) pool.push(q);

  const usedInT1 = new Set((existing.questions || []).map(qkey));   // prefer NOT reusing these

  const secs = (bestPat.sections && bestPat.sections.length)
    ? bestPat.sections.map(s => ({ name: s.name, n: s.totalQuestions }))
    : [{ name: null, n: Math.min(100, pool.length) }];

  // bucket pool by section, each bucket ordered: fresh (not in T1) first, then reusable
  const buckets = new Map();
  const dedupInto = (map, q) => {
    const k = (q.section || '').trim().toLowerCase() || '__any__';
    if (!map.has(k)) map.set(k, new Map());
    if (!map.get(k).has(qkey(q))) map.get(k).set(qkey(q), q);        // dedup identical Qs
  };
  for (const q of pool) dedupInto(buckets, q);
  const order = arr => { const fresh = shuffle(arr.filter(q => !usedInT1.has(qkey(q)))); const reuse = shuffle(arr.filter(q => usedInT1.has(qkey(q)))); return fresh.concat(reuse); };
  const bySec = new Map();
  for (const [k, m] of buckets) bySec.set(k, order([...m.values()]));
  const anyPool = order([...new Map(pool.map(q => [qkey(q), q])).values()]);

  const seen = new Set();
  const picked = [];
  const take = (arr, need) => { for (const q of arr) { if (need <= 0) break; if (seen.has(qkey(q))) continue; seen.add(qkey(q)); picked.push(q); need--; } return need; };
  const chosen = [];
  for (const s of secs) {
    const before = picked.length;
    let need = s.n;
    need = take(s.name ? (bySec.get(s.name.trim().toLowerCase()) || []) : anyPool, need);
    if (need > 0) need = take(anyPool, need);
    chosen.push({ name: s.name, got: picked.length - before, want: s.n });
  }
  const fresh = picked.filter(q => !usedInT1.has(qkey(q))).length;

  const questions = picked.map(q => ({
    questionText: q.questionText, questionImage: q.questionImage || '',
    options: q.options, optionImages: q.optionImages || ['', '', '', ''],
    correctAnswerIndex: q.correctAnswerIndex, explanation: q.explanation || '',
    section: q.section, tags: q.tags || [], difficulty: q.difficulty || 'medium'
  }));

  const title = `${ex.name} – Practice Test - 2`;
  const slug = (title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) + '-' + stamp();
  const doc = {
    examPattern: bestPat._id, title, slug,
    totalMarks: bestPat.totalMarks || questions.length,
    duration: bestPat.duration || 60, accessLevel: 'FREE',
    isPYQ: false, publishedAt: new Date(), questions
  };
  console.log(`\n[${ex.name}] "${bestPat.title}" -> ${questions.length} Q (${fresh} not in Test-1)  ${chosen.map(c => `${c.name || 'all'}:${c.got}/${c.want}`).join(' ')}`);
  if (!DRY) { const t = await PracticeTest.create(doc); console.log(`  created ${t._id}`); }
  created++;
}
console.log(`\n${DRY ? '[DRY] would create' : 'Created'} ${created} Practice Test-2; skipped ${skipped}.`);
await mongoose.disconnect();
