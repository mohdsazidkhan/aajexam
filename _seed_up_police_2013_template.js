/**
 * Seed: UP Police Constable - 2013 (हल प्रश्न-पत्र)
 * UP Police Constable (Uttar Pradesh Police Recruitment & Promotion Board).
 * 160 questions, 3 sections (सामान्य ज्ञान एवं सामयिक विषय 80 / तार्किक क्षमता 40 / आंकिक क्षमता 40).
 * Hindi-only solved paper (Adda247). Answers extracted deterministically from the PDF's
 * red-highlighted option colour-key. 8 figural reasoning questions carry cropped
 * (watermark-stripped, answer-colour-neutralised) question images from _extracted_up_police_2013/.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_up_police_2013');
const CLOUDINARY_FOLDER = 'aajexam/pyq/up-police-constable-2013';
const F = '2013';

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

const GK  = 'सामान्य ज्ञान एवं सामयिक विषय';
const REA = 'तार्किक क्षमता';
const NUM = 'आंकिक क्षमता';

const RAW = [
__RAW__
];

async function uploadImage(fileName, publicId) {
  if (!fileName) return '';
  const localPath = path.join(EXTRACTED_DIR, fileName);
  if (!fs.existsSync(localPath)) { console.warn('  missing image', fileName); return ''; }
  try {
    const res = await cloudinary.uploader.upload(localPath, {
      folder: CLOUDINARY_FOLDER, public_id: publicId, overwrite: true, resource_type: 'image'
    });
    return res.secure_url;
  } catch (e) { console.error('  upload failed', fileName, e.message); return ''; }
}

async function buildQuestions() {
  const questions = [];
  for (const r of RAW) {
    let qImage = '';
    if (r.qi) qImage = await uploadImage(r.qi, `${F}-q-${r.n}`);
    questions.push({
      questionText: r.q,
      questionImage: qImage,
      options: r.o,
      optionImages: ['', '', '', ''],
      correctAnswerIndex: r.ans,
      explanation: '',
      section: r.s,
      tags: [],
      difficulty: 'medium'
    });
    if (r.n % 20 === 0) console.log(`  built ${r.n}/160`);
  }
  return questions;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // UP Police Constable is a State exam - reuse the existing 'State' ExamCategory
  let category = await ExamCategory.findOne({ name: 'State', type: 'State' });
  if (!category) {
    category = await ExamCategory.create({ name: 'State', type: 'State', description: 'State government competitive exams' });
  }

  let exam = await Exam.findOne({ code: 'UP-POLICE-CON' });
  if (!exam) {
    exam = await Exam.create({
      category: category._id,
      name: 'UP Police Constable',
      code: 'UP-POLICE-CON',
      description: 'Uttar Pradesh Police Constable Recruitment Examination'
    });
  }

  const PATTERN_TITLE = 'UP Police Constable 2013';
  let pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) {
    pattern = await ExamPattern.create({
      exam: exam._id, title: PATTERN_TITLE, duration: 150, totalMarks: 160, negativeMarking: 0,
      sections: [
        { name: GK,  totalQuestions: 80, marksPerQuestion: 1, negativePerQuestion: 0 },
        { name: REA, totalQuestions: 40, marksPerQuestion: 1, negativePerQuestion: 0 },
        { name: NUM, totalQuestions: 40, marksPerQuestion: 1, negativePerQuestion: 0 }
      ]
    });
  }

  const TEST_TITLE = 'UP Police Constable - 2013';
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 160, duration: 150,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2013, pyqShift: null,
    pyqExamName: 'UP Police Constable', questions
  });
  console.log(`\nCreated PracticeTest: ${test._id} (${test.questions.length} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
