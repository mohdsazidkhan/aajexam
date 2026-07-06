/**
 * Seed: UPSC Prelims 2015 — Paper I (GS) and Paper II (CSAT).
 * Reads scripts/_q_upsc2015_p1.json (100 Q) and _q_upsc2015_p2.json (80 Q),
 * created by _parse_upsc_pdf.py from the official 'SOLVED PAPERS' PDFs.
 * Uploads figure images (CSAT Q11/Q14) from _extracted_upsc2015_p2/ to Cloudinary.
 *
 * Usage: node scripts/seed-pyq-upsc-2015.js [p1|p2|both]   (default both)
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

const YEAR = parseInt(process.argv[2], 10);
const which = (process.argv[3] || 'both').toLowerCase();
if (!YEAR) { console.error('Usage: node seed-pyq-upsc-2015.js <year> [p1|p2|both]'); process.exit(1); }

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

const PAPERS = {
  p1: {
    json: `_q_upsc${YEAR}_p1.json`, count: 100,
    patternId: '6a4b3bb0922cd75144b04882', section: 'General Studies',
    title: `UPSC Prelims ${YEAR} - General Studies (Paper I)`,
    examName: 'UPSC Civil Services (Prelims) - GS Paper I',
    extractDir: `_extracted_upsc${YEAR}_p1`, folder: `aajexam/pyq/upsc-prelims-${YEAR}-p1`,
    tags: ['UPSC', 'Prelims', 'GS', 'Paper-I', 'PYQ', String(YEAR)]
  },
  p2: {
    json: `_q_upsc${YEAR}_p2.json`, count: 80,
    patternId: '6a4b3bb0922cd75144b04886', section: 'CSAT (Aptitude)',
    title: `UPSC Prelims ${YEAR} - CSAT (Paper II)`,
    examName: 'UPSC Civil Services (Prelims) - CSAT Paper II',
    extractDir: `_extracted_upsc${YEAR}_p2`, folder: `aajexam/pyq/upsc-prelims-${YEAR}-p2`,
    tags: ['UPSC', 'Prelims', 'CSAT', 'Paper-II', 'PYQ', String(YEAR)]
  }
};

const uploadCache = new Map();
async function uploadImage(dir, folder, fileName, publicId) {
  if (!fileName) return '';
  if (uploadCache.has(fileName)) return uploadCache.get(fileName);
  const localPath = path.join(__dirname, '..', dir, fileName);
  if (!fs.existsSync(localPath)) { console.log(`  [missing] ${fileName}`); return ''; }
  const res = await cloudinary.uploader.upload(localPath, {
    folder, public_id: publicId, overwrite: true, resource_type: 'image'
  });
  uploadCache.set(fileName, res.secure_url);
  return res.secure_url;
}

async function seedPaper(key) {
  const P = PAPERS[key];
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, P.json), 'utf-8'));
  if (raw.length !== P.count) { console.error(`${key}: expected ${P.count}, got ${raw.length}`); process.exit(1); }

  const questions = [];
  for (const r of raw) {
    let qImage = '';
    const optImages = ['', '', '', ''];
    if (r.qi) qImage = await uploadImage(P.extractDir, P.folder, r.qi, `q-${r.n}`);
    if (Array.isArray(r.oi)) {
      for (let i = 0; i < 4; i++) {
        if (r.oi[i]) optImages[i] = await uploadImage(P.extractDir, P.folder, r.oi[i], `q-${r.n}-option-${i + 1}`);
      }
    }
    const opts = (r.opts || ['', '', '', '']).slice(0, 4);
    while (opts.length < 4) opts.push('');
    questions.push({
      questionText: r.q || '(see figure)',
      questionImage: qImage,
      options: opts.map((o, i) => o || (optImages[i] ? `(${'ABCD'[i]})` : '')),
      optionImages: optImages,
      correctAnswerIndex: r.answer,
      explanation: r.expl || '',
      section: P.section,
      tags: P.tags,
      difficulty: 'medium'
    });
  }

  await PracticeTest.deleteMany({ examPattern: new mongoose.Types.ObjectId(P.patternId), title: P.title });
  const test = await PracticeTest.create({
    examPattern: new mongoose.Types.ObjectId(P.patternId),
    title: P.title, totalMarks: 200, duration: 120,
    accessLevel: 'FREE', isPYQ: true, pyqYear: YEAR, pyqExamName: P.examName,
    questions
  });
  console.log(`${key}: created PracticeTest ${test._id} (${test.questions.length} questions)`);
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');
  if (which === 'p1' || which === 'both') await seedPaper('p1');
  if (which === 'p2' || which === 'both') await seedPaper('p2');
  await mongoose.disconnect();
  console.log('Done.');
}
run().catch(err => { console.error('Seed failed:', err); process.exit(1); });
