/**
 * Inventory: for every Exam that has at least one PYQ PracticeTest, report how
 * many PYQ vs non-PYQ PracticeTests it has. Used to decide which exams still
 * need a (non-PYQ) Practice Test built from their PYQ pattern.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __d = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__d, '../.env.local') });
dotenv.config({ path: path.resolve(__d, '../.env') });

const Exam = mongoose.models.Exam || mongoose.model('Exam',
  new mongoose.Schema({}, { strict: false }));
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern',
  new mongoose.Schema({}, { strict: false }));
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest',
  new mongoose.Schema({}, { strict: false }));

await mongoose.connect(process.env.MONGO_URI);

const patterns = await ExamPattern.find({}).select('_id exam title').lean();
const patToExam = new Map(patterns.map(p => [String(p._id), String(p.exam)]));
const exams = await Exam.find({}).select('_id name code').lean();
const examName = new Map(exams.map(e => [String(e._id), e.name || e.code]));

const tests = await PracticeTest.find({}).select('_id title examPattern isPYQ questions').lean();
const byExam = new Map();
for (const t of tests) {
  const exId = patToExam.get(String(t.examPattern));
  if (!exId) continue;
  if (!byExam.has(exId)) byExam.set(exId, { pyq: 0, nonpyq: 0, pyqQ: 0, titles: [] });
  const rec = byExam.get(exId);
  if (t.isPYQ) { rec.pyq++; rec.pyqQ += (t.questions || []).length; }
  else { rec.nonpyq++; rec.titles.push(t.title); }
}

const rows = [];
for (const [exId, rec] of byExam) {
  if (rec.pyq === 0) continue;             // only exams that HAVE PYQs
  rows.push({ exam: examName.get(exId) || exId, exId, ...rec });
}
rows.sort((a, b) => (a.nonpyq - b.nonpyq) || (b.pyq - a.pyq));
console.log(`Exams with PYQs: ${rows.length}`);
console.log('NEEDS a non-PYQ Practice Test (nonpyq=0):');
for (const r of rows.filter(r => r.nonpyq === 0))
  console.log(`  [${r.pyq} PYQ tests, ${r.pyqQ} Q] ${r.exam}`);
console.log('\nAlready has a non-PYQ Practice Test:');
for (const r of rows.filter(r => r.nonpyq > 0))
  console.log(`  [${r.nonpyq} test(s)] ${r.exam} :: ${r.titles.slice(0, 3).join(' | ')}`);

await mongoose.disconnect();
