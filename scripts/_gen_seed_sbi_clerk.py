#!/usr/bin/env python3
"""Generate a self-contained SBI Clerk Prelims seed JS from _final_<slug>.json + image map.

Usage:
  python scripts/_gen_seed_sbi_clerk.py <slug> <year> <date-slug> "<Test Title>" \
        <imgmap.json> <imgdir> scripts/seed-pyq-sbi-clerk-prelims-<date-slug>.js

The emitted JS uploads images from <imgdir> to Cloudinary at runtime, then creates/reuses
Exam(SBI-CLERK-PRE) + ExamPattern(SBI Clerk Prelims) and inserts one PracticeTest.
"""
import json, sys

slug, year, date_slug, title, imgmap_path, imgdir, out = sys.argv[1:8]
year = int(year)
data = json.load(open(f'_final_{slug}.json', encoding='utf-8'))
imap = json.load(open(imgmap_path, encoding='utf-8'))
FILES = imap['files']; QIMG = imap['questionImage']; EIMG = imap['explanationImage']

def js(s):
    return json.dumps(s, ensure_ascii=False)

rows = []
for q in data:
    n = q['n']
    rows.append('  { n: %d, s: %s, q: %s, o: %s, a: %d, e: %s, qimg: %s, eimg: %s }' % (
        n, js(q['section']), js(q['questionText']), js(q['options']),
        q['answerIndex'], js(q.get('explanation', '')),
        js(QIMG.get(str(n), '')), js(EIMG.get(str(n), ''))))
RAW = '[\n' + ',\n'.join(rows) + '\n]'
FILES_JS = '{\n' + ',\n'.join(f'  {js(k)}: {js(v)}' for k, v in FILES.items()) + '\n}'

template = r'''/**
 * Seed: SBI Clerk Prelims - %(title)s
 * 100 Q x 1 mark, 3 sections (English 30 / Numerical 35 / Reasoning 35),
 * 60 min total, sectional timing 20 min each, 0.25 negative marking.
 * Question/solution images are uploaded from %(imgdir)s to Cloudinary.
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

const IMG_DIR = path.resolve(__dirname, '../%(imgdir)s');
const CLOUDINARY_FOLDER = 'aajexam/pyq/sbi-clerk-prelims-%(date_slug)s';
const IMAGE_FILES = %(files)s;

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
    explanationImage: { type: String, default: '' },
    section: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' }
  }]
}, { timestamps: true });

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const ENG = 'English Language', NA = 'Numerical Ability', REA = 'Reasoning Ability';
const TAGS = ['SBI', 'Clerk', 'Prelims', 'PYQ', '%(year)s', %(titlejs)s];
const RAW = %(raw)s;

const uploadCache = new Map();
async function uploadKey(key) {
  if (!key) return '';
  if (uploadCache.has(key)) return uploadCache.get(key);
  const fname = IMAGE_FILES[key];
  if (!fname) { console.warn('  no file for key', key); return ''; }
  const local = path.join(IMG_DIR, fname);
  if (!fs.existsSync(local)) { console.warn('  missing file', local); uploadCache.set(key, ''); return ''; }
  try {
    const res = await cloudinary.uploader.upload(local, {
      folder: CLOUDINARY_FOLDER, public_id: 'sbi-%(date_slug)s-' + key, overwrite: true, resource_type: 'image'
    });
    uploadCache.set(key, res.secure_url);
    return res.secure_url;
  } catch (err) {
    console.error('  [upload failed]', key, err.message);
    uploadCache.set(key, ''); return '';
  }
}

async function buildQuestions() {
  const out = [];
  for (const r of RAW) {
    const qImage = await uploadKey(r.qimg);
    const eImage = await uploadKey(r.eimg);
    out.push({
      questionText: r.q,
      questionImage: qImage,
      options: r.o,
      optionImages: ['', '', '', '', ''],
      correctAnswerIndex: r.a,
      explanation: r.e || '',
      explanationImage: eImage,
      section: r.s,
      tags: TAGS,
      difficulty: 'medium'
    });
  }
  return out;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  let category = await ExamCategory.findOne({ name: 'Central', type: 'Central' });
  if (!category) category = await ExamCategory.create({ name: 'Central', type: 'Central', description: 'Central government competitive exams' });

  // Reuse the EXISTING exam (SBI-CLK-P) and its "Preliminary CBT" pattern — do NOT create duplicates.
  const exam = await Exam.findOne({ code: 'SBI-CLK-P' });
  if (!exam) { throw new Error('Exam SBI-CLK-P not found — aborting to avoid creating a duplicate exam.'); }

  const PATTERN_TITLE = 'Preliminary CBT';
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) { throw new Error('ExamPattern "Preliminary CBT" not found — aborting.'); }

  const TEST_TITLE = %(titlejs)s;
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE), totalMarks: 100, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: %(year)s, pyqShift: %(titlejs)s,
    pyqExamName: 'SBI Clerk Prelims', questions
  });
  console.log('\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
'''

content = template % {
    'title': title, 'titlejs': js(title), 'year': year, 'date_slug': date_slug,
    'imgdir': imgdir, 'files': FILES_JS, 'raw': RAW,
}
open(out, 'w', encoding='utf-8').write(content)
print('wrote', out, 'with', len(data), 'questions')
