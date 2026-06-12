/**
 * Seed: RRB Group D (RRC Group D, CEN-02/2018) PYQ — batch 4
 *   (22 Sep 2018 Shift-1, 5 Nov 2018 Shift-1, 5 Nov 2018 Shift-2, 12 Nov 2018 Shift-3)
 * Source: official answer-key / response-sheet papers (image-based), OCR + vision transcribed.
 *   - 5 Nov S1/S2 & 12 Nov S3: clean Adda247 "Correct Option - N" answer key.
 *   - 22 Sep S1: dense CBT response-sheet (green-tick = correct answer).
 * Answers from reliable green-tick / printed correct-option. Figure/chart/cancelled Qs dropped.
 * Reuses the Exam + ExamPattern records created by seed-pyq-rrb-group-d-2018.js.
 *
 * Run: node scripts/seed-pyq-rrb-group-d-2018-d.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

import { PART as PSEP22 } from './_psep22.js';
import { PART as PN5S1 } from './_pnov05s1.js';
import { PART as PN5S2 } from './_pnov05s2.js';
import { PART as PN12 } from './_pnov12.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not found'); process.exit(1); }

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const examCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Central', 'State'], required: true },
  description: { type: String, trim: true }
}, { timestamps: true });

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

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const CLOUD_FOLDER = 'aajexam/pyq/rrb-group-d-2018';

async function uploadIfExists(dir, filename) {
  const fp = path.join(dir, filename);
  if (!fs.existsSync(fp)) { console.log(`  [missing image ${filename}]`); return ''; }
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await cloudinary.uploader.upload(fp, {
        folder: CLOUD_FOLDER,
        public_id: filename.replace(/\.(png|jpe?g)$/i, ''),
        overwrite: true, resource_type: 'image', timeout: 120000
      });
      return res.secure_url;
    } catch (err) {
      if (attempt === 5) throw err;
      process.stdout.write(`(retry ${attempt}) `);
      await new Promise(r => setTimeout(r, 3000 * attempt));
    }
  }
}

async function buildQuestions(parts, imageDir) {
  const out = [];
  for (const item of parts) {
    if (!item.q || item.o.length !== 4 || !item.a) {
      throw new Error(`Bad item orig=${item.orig}: q/opts/answer invalid`);
    }
    let questionImage = '';
    if (item.img) {
      process.stdout.write(`  uploading figure for orig ${item.orig}... `);
      questionImage = await uploadIfExists(imageDir, item.img);
      console.log(questionImage ? 'ok' : 'MISSING');
    }
    out.push({
      questionText: item.q,
      questionImage,
      options: item.o,
      optionImages: ['', '', '', ''],
      correctAnswerIndex: item.a - 1,
      explanation: '',
      section: item.s,
      tags: ['RRB', 'Group D', 'RRC', 'PYQ', '2018'],
      difficulty: 'medium'
    });
  }
  return out;
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

  const FIG_DIR = path.join(__dirname, '_rrcgd_figures');
  const papers = [
    { title: 'RRB Group D - 22 September 2018 Shift-1', shift: 'Shift-1', parts: PSEP22, dir: FIG_DIR },
    { title: 'RRB Group D - 5 November 2018 Shift-1',  shift: 'Shift-1', parts: PN5S1,  dir: FIG_DIR },
    { title: 'RRB Group D - 5 November 2018 Shift-2',  shift: 'Shift-2', parts: PN5S2,  dir: FIG_DIR },
    { title: 'RRB Group D - 12 November 2018 Shift-3', shift: 'Shift-3', parts: PN12,   dir: FIG_DIR }
  ];

  for (const paper of papers) {
    console.log(`\n=== ${paper.title} (${paper.parts.length} questions) ===`);
    await PracticeTest.deleteMany({ examPattern: pattern._id, title: paper.title });
    const questions = await buildQuestions(paper.parts, paper.dir);
    const test = await PracticeTest.create({
      examPattern: pattern._id, title: paper.title,
      totalMarks: questions.length, duration: 90,
      accessLevel: 'FREE', isPYQ: true, pyqYear: 2018, pyqShift: paper.shift,
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
