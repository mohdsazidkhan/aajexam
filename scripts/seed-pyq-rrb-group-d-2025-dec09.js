/**
 * Seed: RRB Group D (RRC Group D) PYQ — 2025 batch, 9 Dec 2025 CBT-1 (Shift-1/2/3)
 * Source: official iON CBT response-sheet papers — docx WITH a real text layer (stems + options
 *   extractable). Parsed by _parse_rrcgd25.py; answer = GREEN-TICK option decoded deterministically
 *   from docx tick-bullets (authoritative — NOT candidate "Chosen Option"). Verified key alignment
 *   + solvable science/math. Dropped: image-stem/image-option figure Qs, unparseable-option Qs.
 * Reuses the Exam + ExamPattern records created by seed-pyq-rrb-group-d-2018.js (same CBT pattern).
 *
 * Run: node scripts/seed-pyq-rrb-group-d-2025-dec09.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { PART as PS1 } from './_p2025s1_dec09.js';
import { PART as PS2 } from './_p2025s2_dec09.js';
import { PART as PS3 } from './_p2025s3_dec09.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not found'); process.exit(1); }

const examSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamCategory', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  logo: { type: String }
}, { timestamps: true });

const examPatternSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  title: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, min: 1 },
  totalMarks: { type: Number, required: true, min: 0 },
  negativeMarking: { type: Number, default: 0, min: 0 },
  sections: [{
    name: { type: String, required: true, trim: true },
    totalQuestions: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 0 },
    negativePerQuestion: { type: Number, default: 0, min: 0 },
    sectionDuration: { type: Number, min: 0 }
  }]
}, { timestamps: true });

const practiceTestSchema = new mongoose.Schema({
  examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, lowercase: true, trim: true },
  totalMarks: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 1 },
  accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  isPYQ: { type: Boolean, default: false },
  pyqYear: { type: Number, default: null },
  pyqShift: { type: String, default: null, trim: true },
  pyqExamName: { type: String, default: null, trim: true },
  publishedAt: { type: Date, default: Date.now },
  questions: [{
    questionText: { type: String, required: true },
    questionImage: { type: String, default: '' },
    options: [{ type: String, required: true }],
    optionImages: [{ type: String, default: '' }],
    correctAnswerIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true },
    section: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' }
  }]
}, { timestamps: true });

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

function buildQuestions(parts) {
  return parts.map(item => {
    if (!item.q || item.o.length !== 4 || !item.a) {
      throw new Error(`Bad item orig=${item.orig}: q/opts/answer invalid`);
    }
    return {
      questionText: item.q,
      questionImage: '',
      options: item.o,
      optionImages: ['', '', '', ''],
      correctAnswerIndex: item.a - 1,
      explanation: '',
      section: item.s,
      tags: ['RRB', 'Group D', 'RRC', 'PYQ', '2025'],
      difficulty: 'medium'
    };
  });
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'RRB-GROUP-D' });
  if (!exam) { console.error('Exam RRB-GROUP-D not found — run seed-pyq-rrb-group-d-2018.js first.'); process.exit(1); }

  const PATTERN_TITLE = 'RRB Group D CBT';
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) { console.error('ExamPattern not found — run base seed first.'); process.exit(1); }
  console.log(`Exam: ${exam._id} | ExamPattern: ${pattern._id}`);

  const papers = [
    { title: 'RRB Group D - 09 December 2025 Shift-1', shift: 'Shift-1', parts: PS1 },
    { title: 'RRB Group D - 09 December 2025 Shift-2', shift: 'Shift-2', parts: PS2 },
    { title: 'RRB Group D - 09 December 2025 Shift-3', shift: 'Shift-3', parts: PS3 }
  ];

  for (const paper of papers) {
    console.log(`\n=== ${paper.title} (${paper.parts.length} questions) ===`);
    await PracticeTest.deleteMany({ examPattern: pattern._id, title: paper.title });
    const questions = buildQuestions(paper.parts);
    const test = await PracticeTest.create({
      examPattern: pattern._id, title: paper.title,
      totalMarks: questions.length, duration: 90,
      accessLevel: 'FREE', isPYQ: true, pyqYear: 2025, pyqShift: paper.shift,
      pyqExamName: 'RRB Group D', questions
    });
    const bySec = {};
    questions.forEach(q => { bySec[q.section] = (bySec[q.section] || 0) + 1; });
    console.log(`Created PracticeTest ${test._id} — ${test.questions.length} questions`);
    console.log('  sections:', JSON.stringify(bySec));
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
