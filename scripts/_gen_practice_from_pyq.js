/**
 * For each exam that has PYQ PracticeTests but NO regular (non-PYQ) Practice
 * Test, create exactly ONE non-PYQ Practice Test by composing a full-length
 * paper sampled from that exam's own verified PYQ questions — matching the
 * exam pattern's section structure (counts), difficulty and style. Reusing
 * PYQ questions keeps answers/images correct (no fabrication).
 *
 * Idempotent: skips any exam that already has a non-PYQ PracticeTest.
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

// deterministic-ish shuffle seeded per call (Math.random is fine in node)
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function stamp() { const d = new Date(); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; }

await mongoose.connect(process.env.MONGO_URI);
console.log('Connected.');

const DRY = process.argv.includes('--dry');
const patterns = await ExamPattern.find({}).lean();
const patById = new Map(patterns.map(p => [String(p._id), p]));
const exams = await Exam.find({}).lean();

const tests = await PracticeTest.find({}).select('title examPattern isPYQ questions').lean();
// group tests by exam
const byExam = new Map();          // examId -> {pyqByPattern: Map, hasNonPyq: bool}
for (const t of tests) {
  const pat = patById.get(String(t.examPattern)); if (!pat) continue;
  const exId = String(pat.exam);
  if (!byExam.has(exId)) byExam.set(exId, { pyqByPattern: new Map(), hasNonPyq: false });
  const rec = byExam.get(exId);
  if (!t.isPYQ) { rec.hasNonPyq = true; continue; }
  if (!rec.pyqByPattern.has(String(t.examPattern))) rec.pyqByPattern.set(String(t.examPattern), []);
  rec.pyqByPattern.get(String(t.examPattern)).push(t);
}

let created = 0, skipped = 0;
for (const ex of exams) {
  const rec = byExam.get(String(ex._id));
  if (!rec || rec.pyqByPattern.size === 0) continue;          // no PYQs
  if (rec.hasNonPyq) { skipped++; continue; }                 // already has one

  // primary pattern = the one whose PYQ tests hold the most questions
  let bestPat = null, bestTests = null, bestQ = -1;
  for (const [patId, ts] of rec.pyqByPattern) {
    const q = ts.reduce((s, t) => s + (t.questions || []).length, 0);
    if (q > bestQ) { bestQ = q; bestPat = patById.get(patId); bestTests = ts; }
  }
  // pool of source questions (from PYQ tests under the chosen pattern)
  const pool = [];
  for (const t of bestTests) for (const q of (t.questions || []))
    if ((q.questionText && q.questionText.trim()) || q.questionImage) pool.push(q);  // drop blank source Qs

  // target section counts from the pattern; fallback: single bucket of 100
  const secs = (bestPat.sections && bestPat.sections.length)
    ? bestPat.sections.map(s => ({ name: s.name, n: s.totalQuestions }))
    : [{ name: null, n: Math.min(100, pool.length) }];

  // bucket pool by section (case-insensitive); '__any__' holds leftovers
  const buckets = new Map();
  for (const q of pool) {
    const k = (q.section || '').trim().toLowerCase() || '__any__';
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(q);
  }
  for (const arr of buckets.values()) shuffle(arr);
  const anyPool = shuffle(pool.slice());

  const seen = new Set();                     // dedup by questionText
  const picked = [];
  const take = (arr, need) => {
    for (const q of arr) {
      if (picked.length && need <= 0) break;
      if (need <= 0) break;
      const key = (q.questionText || '') + '|' + (q.questionImage || '');
      if (seen.has(key)) continue;
      seen.add(key); picked.push(q); need--;
    }
    return need;
  };
  const chosen = [];
  for (const s of secs) {
    const before = picked.length;
    const bkt = s.name ? (buckets.get(s.name.trim().toLowerCase()) || []) : anyPool;
    let need = s.n;
    need = take(bkt, need);
    if (need > 0) need = take(anyPool, need);   // top up from anywhere
    chosen.push({ name: s.name, got: picked.length - before, want: s.n });
  }

  const questions = picked.map(q => ({
    questionText: q.questionText, questionImage: q.questionImage || '',
    options: q.options, optionImages: q.optionImages || ['', '', '', ''],
    correctAnswerIndex: q.correctAnswerIndex,
    explanation: q.explanation || '', section: q.section,
    tags: q.tags || [], difficulty: q.difficulty || 'medium'
  }));

  const title = `${ex.name} – Practice Test - 1`;
  const slug = (title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) + '-' + stamp();
  const doc = {
    examPattern: bestPat._id, title, slug,
    totalMarks: bestPat.totalMarks || questions.length,
    duration: bestPat.duration || 60, accessLevel: 'FREE',
    isPYQ: false, publishedAt: new Date(), questions
  };
  console.log(`\n[${ex.name}] pattern="${bestPat.title}" -> ${questions.length} Q  ${chosen.map(c => `${c.name || 'all'}:${c.got}/${c.want}`).join(' ')}`);
  if (!DRY) { const t = await PracticeTest.create(doc); console.log(`  created ${t._id}`); }
  created++;
}
console.log(`\n${DRY ? '[DRY] would create' : 'Created'} ${created} practice test(s); skipped ${skipped} (already had one).`);
await mongoose.disconnect();
