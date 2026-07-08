/**
 * _update_exams_csv.mjs
 *
 * DB check: Exam-wise Practice Tests aur PYQ count
 * Writes both:
 *   - exams_pt_and_pyq_list.csv  (simple format, no quotes)
 *   - exam_pt_pyq_report.csv     (full report with PYQ years)
 * Run: node _update_exams_csv.mjs
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const examCategorySchema = new mongoose.Schema({ name: String, code: String });
const examSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamCategory' },
  name: String, code: String, isActive: Boolean,
});
const examPatternSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }, title: String,
});
const practiceTestSchema = new mongoose.Schema({
  examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern' },
  title: String,
  isPYQ: { type: Boolean, default: false },
  pyqYear: Number,
  questions: [{ type: Object }],
});

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam         = mongoose.models.Exam         || mongoose.model('Exam', examSchema);
const ExamPattern  = mongoose.models.ExamPattern  || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const results = await PracticeTest.aggregate([
    { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
    { $unwind: '$pattern' },
    { $lookup: { from: 'exams', localField: 'pattern.exam', foreignField: '_id', as: 'exam' } },
    { $unwind: '$exam' },
    {
      $group: {
        _id: '$exam._id',
        examName: { $first: '$exam.name' },
        examCode: { $first: '$exam.code' },
        practiceTestCount: { $sum: { $cond: [{ $eq: ['$isPYQ', false] }, 1, 0] } },
        pyqCount:          { $sum: { $cond: [{ $eq: ['$isPYQ', true]  }, 1, 0] } },
        totalTests:        { $sum: 1 },
        pyqYears: { $addToSet: { $cond: [{ $eq: ['$isPYQ', true] }, '$pyqYear', '$$REMOVE'] } },
      },
    },
    { $sort: { totalTests: -1 } },
  ]);

  const totalPT  = results.reduce((a, r) => a + r.practiceTestCount, 0);
  const totalPYQ = results.reduce((a, r) => a + r.pyqCount, 0);
  const totalAll = results.reduce((a, r) => a + r.totalTests, 0);

  // ── Print table ─────────────────────────────────────────────────────────────
  const maxNameLen = results.reduce((max, r) => Math.max(max, r.examName.length), 0);
  const COL = { rank: 6, exam: maxNameLen + 4, pt: 18, pyq: 14, total: 8 };
  const lineWidth = COL.rank + COL.exam + COL.pt + COL.pyq + COL.total;

  console.log('═'.repeat(lineWidth));
  console.log('Rank'.padEnd(COL.rank) + 'Exams'.padEnd(COL.exam) + 'Practice Tests'.padEnd(COL.pt) + "PYQ's Count".padEnd(COL.pyq) + 'Total');
  console.log('─'.repeat(lineWidth));
  results.forEach((r, i) => {
    console.log(
      String(i + 1).padEnd(COL.rank) + r.examName.padEnd(COL.exam) +
      String(r.practiceTestCount).padEnd(COL.pt) + String(r.pyqCount).padEnd(COL.pyq) + r.totalTests
    );
  });
  console.log('─'.repeat(lineWidth));
  console.log(''.padEnd(COL.rank) + 'TOTAL'.padEnd(COL.exam) + String(totalPT).padEnd(COL.pt) + String(totalPYQ).padEnd(COL.pyq) + totalAll);
  console.log('═'.repeat(lineWidth));
  console.log(`\n📊 Summary:`);
  console.log(`   Total Exams    : ${results.length}`);
  console.log(`   Practice Tests : ${totalPT}`);
  console.log(`   PYQ Papers     : ${totalPYQ}`);
  console.log(`   Grand Total    : ${totalAll}\n`);

  const __dirname = dirname(fileURLToPath(import.meta.url));

  // ── 1. exams_pt_and_pyq_list.csv (simple, no quotes) ────────────────────────
  const simpleRows = ['Rank,Exam Name,Exam Code,Practice Tests,PYQ\'s Count,Total'];
  results.forEach((r, i) => {
    simpleRows.push(`${i + 1},${r.examName},${r.examCode || ''},${r.practiceTestCount},${r.pyqCount},${r.totalTests}`);
  });
  simpleRows.push(`Total,,,${totalPT},${totalPYQ},${totalAll}`);
  simpleRows.push('');
  const simplePath = join(__dirname, 'exams_pt_and_pyq_list.csv');
  writeFileSync(simplePath, simpleRows.join('\r\n'), 'utf8');
  console.log(`✅ Saved: exams_pt_and_pyq_list.csv`);

  // ── 2. exam_pt_pyq_report.csv (full report with PYQ years, BOM for Excel) ───
  const fullRows = [['Rank', 'Exam Name', 'Exam Code', 'Practice Tests', "PYQ's Count", 'Total', 'PYQ Years']];
  results.forEach((r, i) => {
    const pyqYears = [...r.pyqYears].filter(Boolean).sort((a, b) => a - b).join(' | ');
    fullRows.push([i + 1, r.examName, r.examCode || '', r.practiceTestCount, r.pyqCount, r.totalTests, pyqYears]);
  });
  fullRows.push([]);
  fullRows.push(['', 'TOTAL', '', totalPT, totalPYQ, totalAll, '']);
  const fullCsv = fullRows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const fullPath = join(__dirname, 'exam_pt_pyq_report.csv');
  writeFileSync(fullPath, '\uFEFF' + fullCsv, 'utf8');
  console.log(`✅ Saved: exam_pt_pyq_report.csv`);

  // ── Exams with ZERO content ──────────────────────────────────────────────────
  const allExams   = await Exam.find({ isActive: true }).lean();
  const coveredIds = new Set(results.map(r => r._id.toString()));
  const SKIP_CODES = ['CBSE'];
  const zeroExams  = allExams.filter(e => !coveredIds.has(e._id.toString()) && !SKIP_CODES.includes(e.code));
  if (zeroExams.length > 0) {
    console.log(`\n⚠️  Exams with NO content (${zeroExams.length}):`);
    zeroExams.forEach(e => console.log(`   - ${e.name} (${e.code})`));
  }

  await mongoose.disconnect();
  console.log('\n✅ Done.');
}

main().catch(err => { console.error('❌ Error:', err); process.exit(1); });
