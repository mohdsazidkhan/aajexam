/**
 * _update_exams_csv.mjs
 *
 * DB check: Exam-wise Practice Tests, PYQs, Quizzes, Subjects, and Topics count
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
const subjectSchema = new mongoose.Schema({
  name: String, exams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
});
const topicSchema = new mongoose.Schema({
  name: String, subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }
});
const quizSchema = new mongoose.Schema({
  title: String, applicableExams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }]
});

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam         = mongoose.models.Exam         || mongoose.model('Exam', examSchema);
const ExamPattern  = mongoose.models.ExamPattern  || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);
const Subject      = mongoose.models.Subject      || mongoose.model('Subject', subjectSchema);
const Topic        = mongoose.models.Topic        || mongoose.model('Topic', topicSchema);
const Quiz         = mongoose.models.Quiz         || mongoose.model('Quiz', quizSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const allExams = await Exam.find({}).lean();
  const allPatterns = await ExamPattern.find({}).lean();
  
  const patToExam = new Map(allPatterns.map(p => [String(p._id), String(p.exam)]));
  
  const report = new Map();
  for (const e of allExams) {
    report.set(String(e._id), {
      examId: e._id,
      examName: e.name,
      examCode: e.code,
      pyqCount: 0,
      practiceTestCount: 0,
      totalTests: 0,
      pyqYears: new Set(),
      quizzes: 0,
      subjects: 0,
      topics: 0
    });
  }

  // 1. PracticeTests & PYQs
  const tests = await PracticeTest.find({}).lean();
  for (const t of tests) {
    const exId = patToExam.get(String(t.examPattern));
    if (exId && report.has(exId)) {
      const r = report.get(exId);
      if (t.isPYQ) {
        r.pyqCount++;
        if (t.pyqYear) r.pyqYears.add(t.pyqYear);
      } else {
        r.practiceTestCount++;
      }
      r.totalTests++;
    }
  }

  // 2. Quizzes
  const quizzes = await Quiz.find({}).lean();
  for (const q of quizzes) {
    if (Array.isArray(q.applicableExams)) {
      for (const eId of q.applicableExams) {
        if (report.has(String(eId))) {
          report.get(String(eId)).quizzes++;
        }
      }
    }
  }

  // 3. Subjects
  const subjects = await Subject.find({}).lean();
  const subToExams = new Map();
  for (const s of subjects) {
    subToExams.set(String(s._id), []);
    if (Array.isArray(s.exams)) {
      for (const eId of s.exams) {
        if (report.has(String(eId))) {
          report.get(String(eId)).subjects++;
          subToExams.get(String(s._id)).push(String(eId));
        }
      }
    }
  }

  // 4. Topics
  const topics = await Topic.find({}).lean();
  for (const t of topics) {
    const examsForSub = subToExams.get(String(t.subject));
    if (examsForSub) {
      for (const eId of examsForSub) {
        if (report.has(eId)) report.get(eId).topics++;
      }
    }
  }

  const results = Array.from(report.values())
    .filter(r => r.pyqCount > 0 || r.practiceTestCount > 0 || r.quizzes > 0 || r.subjects > 0 || r.topics > 0)
    .sort((a, b) => (b.quizzes + b.pyqCount + b.practiceTestCount) - (a.quizzes + a.pyqCount + a.practiceTestCount));

  const totalPT  = results.reduce((a, r) => a + r.practiceTestCount, 0);
  const totalPYQ = results.reduce((a, r) => a + r.pyqCount, 0);
  const totalQuizzes = results.reduce((a, r) => a + r.quizzes, 0);
  const totalAll = results.reduce((a, r) => a + r.totalTests, 0);

  // ── Print table ─────────────────────────────────────────────────────────────
  const maxNameLen = results.reduce((max, r) => Math.max(max, (r.examName || '').length), 0);
  const COL = { rank: 6, exam: maxNameLen + 4, pt: 18, pyq: 14, quizzes: 10, total: 8 };
  const lineWidth = COL.rank + COL.exam + COL.pt + COL.pyq + COL.quizzes + COL.total;

  console.log('═'.repeat(lineWidth));
  console.log('Rank'.padEnd(COL.rank) + 'Exams'.padEnd(COL.exam) + 'Practice Tests'.padEnd(COL.pt) + "PYQ's Count".padEnd(COL.pyq) + 'Quizzes'.padEnd(COL.quizzes) + 'Total');
  console.log('─'.repeat(lineWidth));
  results.forEach((r, i) => {
    console.log(
      String(i + 1).padEnd(COL.rank) + (r.examName || '').padEnd(COL.exam) +
      String(r.practiceTestCount).padEnd(COL.pt) + String(r.pyqCount).padEnd(COL.pyq) + String(r.quizzes).padEnd(COL.quizzes) + r.totalTests
    );
  });
  console.log('─'.repeat(lineWidth));
  console.log(''.padEnd(COL.rank) + 'TOTAL'.padEnd(COL.exam) + String(totalPT).padEnd(COL.pt) + String(totalPYQ).padEnd(COL.pyq) + String(totalQuizzes).padEnd(COL.quizzes) + totalAll);
  console.log('═'.repeat(lineWidth));
  console.log(`\n📊 Summary:`);
  console.log(`   Total Exams    : ${results.length}`);
  console.log(`   Practice Tests : ${totalPT}`);
  console.log(`   PYQ Papers     : ${totalPYQ}`);
  console.log(`   Quizzes        : ${totalQuizzes}`);
  console.log(`   Grand Total    : ${totalAll}\n`);

  const __dirname = dirname(fileURLToPath(import.meta.url));

  // ── 1. exams_pt_and_pyq_list.csv (simple, no quotes) ────────────────────────
  const simpleRows = ['Rank,Exam Name,Exam Code,Practice Tests,PYQ\'s Count,Quizzes,Subjects,Topics,Total'];
  results.forEach((r, i) => {
    simpleRows.push(`${i + 1},${r.examName},${r.examCode || ''},${r.practiceTestCount},${r.pyqCount},${r.quizzes},${r.subjects},${r.topics},${r.totalTests}`);
  });
  simpleRows.push(`Total,,,${totalPT},${totalPYQ},${totalQuizzes},,,${totalAll}`);
  simpleRows.push('');
  const simplePath = join(__dirname, 'exams_pt_and_pyq_list.csv');
  writeFileSync(simplePath, simpleRows.join('\r\n'), 'utf8');
  console.log(`✅ Saved: exams_pt_and_pyq_list.csv`);

  // ── 2. exam_pt_pyq_report.csv (full report with PYQ years, BOM for Excel) ───
  const fullRows = [['Rank', 'Exam Name', 'Exam Code', 'Practice Tests', "PYQ's Count", 'Quizzes', 'Subjects', 'Topics', 'Total', 'PYQ Years']];
  results.forEach((r, i) => {
    const pyqYears = [...r.pyqYears].filter(Boolean).sort((a, b) => a - b).join(' | ');
    fullRows.push([i + 1, r.examName, r.examCode || '', r.practiceTestCount, r.pyqCount, r.quizzes, r.subjects, r.topics, r.totalTests, pyqYears]);
  });
  fullRows.push([]);
  fullRows.push(['', 'TOTAL', '', totalPT, totalPYQ, totalQuizzes, '', '', totalAll, '']);
  const fullCsv = fullRows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const fullPath = join(__dirname, 'exam_pt_pyq_report.csv');
  writeFileSync(fullPath, '\uFEFF' + fullCsv, 'utf8');
  console.log(`✅ Saved: exam_pt_pyq_report.csv`);

  // ── Exams with ZERO content ──────────────────────────────────────────────────
  const coveredIds = new Set(results.map(r => r.examId.toString()));
  const SKIP_CODES = ['CBSE'];
  const zeroExams  = allExams.filter(e => e.isActive && !coveredIds.has(e._id.toString()) && !SKIP_CODES.includes(e.code));
  if (zeroExams.length > 0) {
    console.log(`\n⚠️  Exams with NO content (${zeroExams.length}):`);
    zeroExams.forEach(e => console.log(`   - ${e.name} (${e.code})`));
  }

  await mongoose.disconnect();
  console.log('\n✅ Done.');
}

main().catch(err => { console.error('❌ Error:', err); process.exit(1); });
