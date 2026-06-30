#!/usr/bin/env python3
"""Generate a seed-pyq JS file for a 2023 Delhi Police Constable shift from its
parsed _dpc2023_<slug>.json. Mirrors the established seed-pyq-dpc-*.js template
(reuses Exam SSC-DPC + ExamPattern 'Computer-Based Test (CBT)').

Usage: python scripts/_gen_seed_dpc2023.py <slug> <date-slug> <ShiftLabel> <year>
  e.g. python scripts/_gen_seed_dpc2023.py 14nov2023-s1 14nov2023-s1 "14 Nov 2023 Shift-1" 2023
Outputs scripts/seed-pyq-dpc-<date-slug>.js and uses _seedimg_dpc<imgtag>_<sN>.
"""
import json, sys

SLUG, DATESLUG, SHIFTLABEL, YEAR = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
data = json.load(open(f'_dpc2023_{SLUG}.json', encoding='utf-8'))

TITLE = f"Delhi Police Constable - {SHIFTLABEL}"
# image dir tag, e.g. 14nov2023-s1 -> dpc14nov2023_s1
itag = DATESLUG.replace('-', '_')
IMG_DIR = f"_seedimg_dpc{itag}"
CLOUD_FOLDER = f"aajexam/pyq/dpc-{DATESLUG}"

def js(s):
    return json.dumps(s, ensure_ascii=False)

raw_lines = []
for q in data:
    qimg = f"{DATESLUG}-q-{q['n']}.png" if q.get('crop') else ""
    o = "[" + ", ".join(js(x) for x in q['options']) + "]"
    raw_lines.append(
        f"  {{ n: {q['n']}, s: {js(q['section'])}, q: {js(q['qtext'])}, "
        f"o: {o}, a: {q['ans']}, e: \"\", qimg: {js(qimg)} }}"
    )
RAW = ",\n".join(raw_lines)

TAGS = ['Delhi Police', 'Constable', 'PYQ', YEAR, TITLE]
tags_js = "[" + ", ".join(js(t) for t in TAGS) + "]"

out = f'''/**
 * Seed: Delhi Police Constable - {SHIFTLABEL}
 * 100 Q x 1 mark, 90 min. Reuses Exam SSC-DPC + pattern 'Computer-Based Test (CBT)'.
 * Source: official TCS/iON 'Question Paper with Answers' PDF (deterministic green
 * colour answer key). Figure/figural questions upload a local crop as questionImage.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import {{ fileURLToPath }} from 'url';
import {{ v2 as cloudinary }} from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({{ path: path.resolve(__dirname, '../.env.local') }});
dotenv.config({{ path: path.resolve(__dirname, '../.env') }});

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {{ console.error('MONGO_URI not found'); process.exit(1); }}

cloudinary.config({{
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
}});

const IMG_DIR = path.resolve(__dirname, '../{IMG_DIR}');
const CLOUDINARY_FOLDER = '{CLOUD_FOLDER}';

const examPatternSchema = new mongoose.Schema({{
  exam: {{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true }},
  title: {{ type: String, required: true, trim: true }},
  duration: {{ type: Number }}, totalMarks: {{ type: Number }}, negativeMarking: {{ type: Number }},
  sections: [{{ name: String, totalQuestions: Number, marksPerQuestion: Number,
    negativePerQuestion: Number, sectionDuration: Number }}]
}}, {{ timestamps: true }});
const examSchema = new mongoose.Schema({{
  category: mongoose.Schema.Types.ObjectId, name: String, code: String
}}, {{ timestamps: true }});
const practiceTestSchema = new mongoose.Schema({{
  examPattern: {{ type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true }},
  title: {{ type: String, required: true, trim: true }},
  slug: {{ type: String, lowercase: true, trim: true }},
  totalMarks: {{ type: Number, required: true }}, duration: {{ type: Number, required: true }},
  accessLevel: {{ type: String, enum: ['FREE', 'PRO'], default: 'FREE' }},
  isPYQ: {{ type: Boolean, default: false }}, pyqYear: {{ type: Number, default: null }},
  pyqShift: {{ type: String, default: null }}, pyqExamName: {{ type: String, default: null }},
  publishedAt: {{ type: Date, default: Date.now }},
  questions: [{{
    questionText: {{ type: String, required: true }},
    questionImage: {{ type: String, default: '' }},
    options: [{{ type: String, required: true }}],
    optionImages: [{{ type: String, default: '' }}],
    correctAnswerIndex: {{ type: Number, required: true, min: 0 }},
    explanation: {{ type: String, trim: true }},
    explanationImage: {{ type: String, default: '' }},
    section: {{ type: String, required: true, trim: true }},
    tags: [{{ type: String, trim: true }}],
    difficulty: {{ type: String, enum: ['easy','medium','hard','mixed'], default: 'medium' }}
  }}]
}}, {{ timestamps: true }});

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = {tags_js};
const RAW = [
{RAW}
];

const uploadCache = new Map();
async function uploadImg(fname) {{
  if (!fname) return '';
  if (uploadCache.has(fname)) return uploadCache.get(fname);
  const local = path.join(IMG_DIR, fname);
  if (!fs.existsSync(local)) {{ console.warn('  missing img', local); uploadCache.set(fname, ''); return ''; }}
  try {{
    const res = await cloudinary.uploader.upload(local, {{
      folder: CLOUDINARY_FOLDER, public_id: fname.replace(/\\.png$/, ''), overwrite: true, resource_type: 'image'
    }});
    uploadCache.set(fname, res.secure_url); return res.secure_url;
  }} catch (err) {{ console.error('  [upload failed]', fname, err.message); uploadCache.set(fname, ''); return ''; }}
}}

async function buildQuestions() {{
  const out = [];
  for (const r of RAW) {{
    const qImage = await uploadImg(r.qimg);
    out.push({{
      questionText: r.q, questionImage: qImage, options: r.o,
      optionImages: ['', '', '', ''], correctAnswerIndex: r.a,
      explanation: r.e || '', section: r.s, tags: TAGS, difficulty: 'medium'
    }});
  }}
  return out;
}}

async function seed() {{
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\\n');

  const exam = await Exam.findOne({{ code: 'SSC-DPC' }});
  if (!exam) throw new Error('Exam SSC-DPC not found — aborting.');
  const pattern = await ExamPattern.findOne({{ exam: exam._id, title: 'Computer-Based Test (CBT)' }});
  if (!pattern) throw new Error('ExamPattern "Computer-Based Test (CBT)" not found — aborting.');

  const TEST_TITLE = {js(TITLE)};
  await PracticeTest.deleteMany({{ examPattern: pattern._id, title: TEST_TITLE }});

  console.log('Building questions (uploading figure images)...');
  const questions = await buildQuestions();
  const withImg = questions.filter(q => q.questionImage).length;
  console.log('  questions with image:', withImg);

  const test = await PracticeTest.create({{
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: {YEAR},
    pyqShift: TEST_TITLE, pyqExamName: 'Delhi Police Constable', questions
  }});
  console.log('\\nCreated PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}}
seed().catch(err => {{ console.error('Seed failed:', err); process.exit(1); }});
'''

fn = f"scripts/seed-pyq-dpc-{DATESLUG}.js"
open(fn, 'w', encoding='utf-8').write(out)
withimg = sum(1 for q in data if q.get('crop'))
print(f"wrote {fn}: {len(data)} Q, {withimg} with image")
