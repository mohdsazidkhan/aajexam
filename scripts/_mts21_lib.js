/**
 * Shared library for SSC MTS 2021 PYQ seed scripts (all 8 Oct shifts).
 * Each per-shift script imports buildAndSeed() and passes its own RAW + config.
 *
 * SSC MTS (2019 Pattern) Paper-I: 25 Q each (English / Reasoning / Numerical /
 * GA). 1 mark each, 0.25 negative, 100 marks, 100 min. (2021 shares the same
 * structure as 2017/2019; user chose to reuse the 2019 pattern, 2026-06-01.)
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

function sectionFor(n) {
  if (n <= 25) return ENG;
  if (n <= 50) return REA;
  if (n <= 75) return NUM;
  return GA;
}

/**
 * @param {object} cfg
 *   cfg.RAW        - array of {n,q,o[4],ans,e}
 *   cfg.imageMap   - { qNum: 'q-xx.png' }
 *   cfg.imagesDir  - absolute path to the shift's images folder
 *   cfg.cloudFolder- cloudinary folder
 *   cfg.publicPrefix - public_id prefix for uploads
 *   cfg.testTitle  - PracticeTest title
 *   cfg.pyqShift   - pyqShift string
 */
export async function buildAndSeed(cfg) {
  const { RAW, imageMap = {}, imagesDir, cloudFolder, publicPrefix, testTitle, pyqShift } = cfg;

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

  const PATTERN_TITLE = 'SSC MTS (2019 Pattern)';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 100, totalMarks: 100, negativeMarking: 0.25,
      sections: [
        { name: ENG, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 0 },
        { name: REA, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 0 },
        { name: NUM, totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 0 },
        { name: GA,  totalQuestions: 25, marksPerQuestion: 1, negativePerQuestion: 0.25, sectionDuration: 0 }
      ]
    });
    console.log(`Created ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);
  } else console.log(`Found ExamPattern: ${PATTERN_TITLE} (${pattern._id})`);

  const all = RAW.slice().sort((a, b) => a.n - b.n);
  if (all.length !== 100) throw new Error(`Expected 100 questions, got ${all.length}`);
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
      tags: ['SSC', 'MTS', 'Paper-I', 'PYQ', '2021'], difficulty: 'medium'
    });
  }
  console.log(`Built ${questions.length} questions.`);

  await PracticeTest.deleteMany({ examPattern: pattern._id, title: testTitle });
  const test = await PracticeTest.create({
    examPattern: pattern._id, title: testTitle, totalMarks: 100, duration: 100,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2021, pyqShift, pyqExamName: 'SSC MTS', questions
  });
  console.log(`\nCreated PYQ PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}
