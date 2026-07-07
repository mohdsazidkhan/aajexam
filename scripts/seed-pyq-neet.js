/**
 * Seed: NEET (UG) PYQ paper. Reads scripts/_q_neet<YEAR>_final.json (180 Q) built
 * by _parse_neet_pdf.py + _finalize_neet<YEAR>.py, uploads figure/question crops
 * from scripts/_extracted_neet<YEAR>/ to Cloudinary, and creates one PracticeTest
 * under the existing NEET exam's 'NEET (UG)' pattern (reused, never created here).
 *
 * Usage: node scripts/seed-pyq-neet.js <year> [phase]
 *   e.g. 2013           -> "NEET (UG) 2013"
 *        2015 p1        -> "NEET (UG) 2015 (Phase I)"  (reads _q_neet2015p1_final.json)
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

const YEAR = parseInt(process.argv[2], 10);
if (!YEAR) { console.error('Usage: node seed-pyq-neet.js <year> [phase]'); process.exit(1); }
const PHASE = (process.argv[3] || '').toLowerCase();   // '', 'p1', 'p2'
const PHASE_LABEL = { p1: 'Phase I', p2: 'Phase II' }[PHASE] || null;
const SUFFIX = PHASE_LABEL ? PHASE : '';               // filename/folder suffix

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const Exam = mongoose.models.Exam || mongoose.model('Exam',
  new mongoose.Schema({ name: String, code: String }));
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern',
  new mongoose.Schema({ exam: mongoose.Schema.Types.ObjectId, title: String }));

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
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

// 2021-2024: 200-question format (Physics/Chemistry/Botany/Zoology, 50 each).
// 2025 reverted to (and earlier were) 180-question (Physics 45 / Chemistry 45 / Biology 90).
const IS_200 = YEAR >= 2021 && YEAR <= 2024;
const N_Q = IS_200 ? 200 : 180;
const PATTERN_TITLE = IS_200 ? 'NEET (UG) 2021 Onwards' : 'NEET (UG)';
const sectionFor = IS_200
  ? n => (n <= 50 ? 'Physics' : n <= 100 ? 'Chemistry' : n <= 150 ? 'Botany' : 'Zoology')
  : n => (n <= 45 ? 'Physics' : n <= 90 ? 'Chemistry' : 'Biology');

const uploadCache = new Map();
async function uploadImage(dir, folder, fileName, publicId) {
  if (!fileName) return '';
  if (uploadCache.has(fileName)) return uploadCache.get(fileName);
  const localPath = path.join(__dirname, dir, fileName);
  if (!fs.existsSync(localPath)) { console.log(`  [missing] ${fileName}`); return ''; }
  const res = await cloudinary.uploader.upload(localPath, {
    folder, public_id: publicId, overwrite: true, resource_type: 'image'
  });
  uploadCache.set(fileName, res.secure_url);
  return res.secure_url;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  const exam = await Exam.findOne({ $or: [{ code: /^NEET$/i }, { name: /^NEET$/i }] });
  if (!exam) { console.error('NEET exam not found'); process.exit(1); }
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) { console.error(`Pattern '${PATTERN_TITLE}' not found — run setup-pattern-neet.js`); process.exit(1); }

  const jsonPath = path.join(__dirname, `_q_neet${YEAR}${SUFFIX}_final.json`);
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  if (raw.length !== N_Q) { console.error(`expected ${N_Q} questions, got ${raw.length}`); process.exit(1); }

  const extractDir = `_extracted_neet${YEAR}${SUFFIX}`;
  const folder = `aajexam/pyq/neet-${YEAR}${SUFFIX ? '-' + SUFFIX : ''}`;
  const tags = ['NEET', 'UG', 'PYQ', String(YEAR)];

  const questions = [];
  for (const r of raw) {
    const qImage = r.qi ? await uploadImage(extractDir, folder, r.qi, `q-${r.n}`) : '';
    const opts = (r.opts || []).slice(0, 4);
    while (opts.length < 4) opts.push('');
    questions.push({
      questionText: r.q || '(see figure)',
      questionImage: qImage,
      options: opts.map((o, i) => o || `(${'ABCD'[i]})`),
      optionImages: ['', '', '', ''],
      correctAnswerIndex: r.answer,
      explanation: r.expl || '',
      section: sectionFor(r.n),
      tags,
      difficulty: 'medium'
    });
  }

  const title = PHASE_LABEL ? `NEET (UG) ${YEAR} (${PHASE_LABEL})` : `NEET (UG) ${YEAR}`;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title });
  const test = await PracticeTest.create({
    examPattern: pattern._id, title,
    totalMarks: 720, duration: IS_200 ? 200 : 180, accessLevel: 'FREE',
    isPYQ: true, pyqYear: YEAR, pyqShift: PHASE_LABEL, pyqExamName: 'NEET (UG)',
    questions
  });
  console.log(`Created PracticeTest ${test._id} — "${title}" (${test.questions.length} Q, ${questions.filter(q => q.questionImage).length} images)`);
  await mongoose.disconnect();
  console.log('Done.');
}
run().catch(err => { console.error('Seed failed:', err); process.exit(1); });
