/**
 * Shared library for SSC MTS 2023 PYQ seed scripts (new 2-session CBT pattern).
 * Each per-shift script imports buildAndSeed() and passes its own RAW + config.
 *
 * SSC MTS (2023 Pattern) — 90 questions, 270 marks, 90 minutes, 3 marks each:
 *   General English   (Q1-25, 25Q)  — 1 mark negative per wrong answer
 *   Reasoning         (Q26-45, 20Q) — NO negative marking
 *   Numerical Aptitude(Q46-65, 20Q) — NO negative marking
 *   General Awareness (Q66-90, 25Q) — 1 mark negative per wrong answer
 * (Differs from the 2016/2017/2019/2021/2022 patterns; user confirmed a new
 * year-named ExamPattern, 2026-06-02.)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

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

export const ENG = 'General English';
export const REA = 'General Intelligence & Reasoning';
export const NUM = 'Numerical Aptitude';
export const GA  = 'General Awareness';
export const OPT4 = ['Option (1)', 'Option (2)', 'Option (3)', 'Option (4)'];

// 2023 pattern ranges: ENG 1-25, REA 26-45, NUM 46-65, GA 66-90.
function sectionFor(n) {
  if (n <= 25) return ENG;
  if (n <= 45) return REA;
  if (n <= 65) return NUM;
  return GA;
}

/**
 * @param {object} cfg
 *   cfg.RAW        - array of {n,q,o[4],ans,e} (90 questions, n = 1..90)
 *   cfg.imageMap   - { qNum: 'q-xx.png' }
 *   cfg.imagesDir  - absolute path to the shift's images folder
 *   cfg.cloudFolder- cloudinary folder
 *   cfg.publicPrefix - public_id prefix for uploads
 *   cfg.testTitle  - PracticeTest title
 *   cfg.pyqShift   - pyqShift string
 *   cfg.pyqYear    - PYQ year (default 2023; also used in tags)
 */
export async function buildAndSeed(cfg) {
  const { RAW, imageMap = {}, imagesDir, cloudFolder, publicPrefix, testTitle, pyqShift, pyqYear = 2023 } = cfg;

  async function uploadIfExists(filename) {
    const fp = path.join(imagesDir, filename);
    if (!fs.existsSync(fp)) { console.log(`  MISSING image ${filename}`); return ''; }
    const res = await cloudinary.uploader.upload(fp, {
      folder: cloudFolder, public_id: publicPrefix + filename.replace(/\.png$/i, ''),
      overwrite: true, resource_type: 'image'
    });
    return res.secure_url;
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  let category = await ExamCategory.findOne({ name: 'Central', type: 'Central' });
  if (!category) category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });
  console.log(`ExamCategory: Central (${category._id})`);

  let exam = await Exam.findOne({ code: 'SSC-MTS' });
  if (!exam) exam = await Exam.create({ category: category._id, name: 'SSC MTS', code: 'SSC-MTS', description: 'Staff Selection Commission - Multi Tasking (Non-Technical) Staff', isActive: true });
  console.log(`Exam: SSC MTS (${exam._id})`);

  const PATTERN_TITLE = 'SSC MTS (2023 Pattern)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 90, totalMarks: 270, negativeMarking: 1,
      sections: [
        { name: ENG, totalQuestions: 25, marksPerQuestion: 3, negativePerQuestion: 1, sectionDuration: 0 },
        { name: REA, totalQuestions: 20, marksPerQuestion: 3, negativePerQuestion: 0, sectionDuration: 0 },
        { name: NUM, totalQuestions: 20, marksPerQuestion: 3, negativePerQuestion: 0, sectionDuration: 0 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 3, negativePerQuestion: 1, sectionDuration: 0 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);

  const all = RAW.slice().sort((a, b) => a.n - b.n);
  if (all.length !== 90) throw new Error(`Expected 90 questions, got ${all.length}`);
  all.forEach((q, i) => { if (q.n !== i + 1) throw new Error(`Q numbering gap at index ${i}: n=${q.n}`); });

  console.log('\nBuilding questions...');
  const questions = [];
  for (const r of all) {
    if (!Array.isArray(r.o) || r.o.length !== 4) throw new Error(`Q${r.n} not 4 options`);
    if (typeof r.ans !== 'number' || r.ans < 0 || r.ans > 3) throw new Error(`Q${r.n} bad ans ${r.ans}`);
    let questionImage = '';
    if (imageMap[r.n]) {
      process.stdout.write(`Uploading Q${r.n} image... `);
      questionImage = await uploadIfExists(imageMap[r.n]);
      console.log(questionImage ? 'ok' : 'missing');
    }
    questions.push({
      questionText: r.q, questionImage, options: r.o, optionImages: ['', '', '', ''],
      correctAnswerIndex: r.ans, explanation: r.e || '', section: sectionFor(r.n),
      tags: ['SSC', 'MTS', 'PYQ', String(pyqYear)], difficulty: 'medium'
    });
  }
  console.log(`Built ${questions.length} questions.`);

  await PracticeTest.deleteMany({ examPattern: pattern._id, title: testTitle });
  const test = await PracticeTest.create({
    examPattern: pattern._id, title: testTitle, totalMarks: 270, duration: 90,
    accessLevel: 'FREE', isPYQ: true, pyqYear, pyqShift, pyqExamName: 'SSC MTS', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}
