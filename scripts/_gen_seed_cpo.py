"""Generate seed JS for SSC CPO Tier-I paper.

Reads _questions_<slug>.json (from _parse_cpo.py) and produces a Node.js seed
script that:
  1. Uploads images from _extracted_<slug>/ to Cloudinary at aajexam/pyq/ssc-cpo-<date-slug>/
  2. Creates SSC-CPO Exam + ExamPattern (200 Q × 4 sections × 50, 1 mark, 0.25 neg, 120 min)
  3. Inserts PracticeTest with 200 questions

Usage: _gen_seed_cpo.py <slug> <date-slug> <test-title> <output-js>
  e.g. _gen_seed_cpo.py cpo_1jul2017_s1 1-jul-2017-s1 "SSC CPO Tier-I - 1 July 2017 Shift-1" scripts/seed-pyq-ssc-cpo-1jul2017-s1.js
"""
import sys
import json
import os

if len(sys.argv) < 5:
    print(__doc__)
    sys.exit(1)

slug, date_slug, test_title, out_js = sys.argv[1:5]

with open(f'_questions_{slug}.json', encoding='utf-8') as f:
    qs = json.load(f)

if len(qs) != 200:
    print(f"WARN: expected 200 questions, got {len(qs)}")

def js_str(s):
    s = s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    return f"`{s}`"

KEY = [{'A': 1, 'B': 2, 'C': 3, 'D': 4}.get(q['answer'], 1) for q in qs]

# Build RAW array
raw_items = []
for q in qs:
    sec = q.get('section') or 'General Intelligence and Reasoning'
    qtext = q.get('q', '')
    opts = q.get('opts', ['', '', '', ''])
    sol = (q.get('sol') or '')[:1000]
    q_img = q.get('q_image', '')
    opt_imgs = q.get('opt_images', ['', '', '', ''])
    while len(opts) < 4:
        opts.append('')
    while len(opt_imgs) < 4:
        opt_imgs.append('')
    item = (
        f"  {{ n: {q['n']}, s: {js_str(sec)}, "
        f"q: {js_str(qtext)}, qi: {js_str(q_img)}, "
        f"o: [{js_str(opts[0])}, {js_str(opts[1])}, {js_str(opts[2])}, {js_str(opts[3])}], "
        f"oi: [{js_str(opt_imgs[0])}, {js_str(opt_imgs[1])}, {js_str(opt_imgs[2])}, {js_str(opt_imgs[3])}], "
        f"e: {js_str(sol)} }}"
    )
    raw_items.append(item)
RAW_JS = ',\n'.join(raw_items)

JS = f'''/**
 * Seed: {test_title}
 * SSC CPO (Paper-I) Tier-I — official SSC paper (2017+).
 * 200 Q × 1 mark, 4 sections × 50, 120 min, 0.25 negative.
 * Uploads question/option images from local _extracted_{slug}/ to Cloudinary.
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

const EXTRACTED_DIR = path.resolve(__dirname, '../_extracted_{slug}');
const CLOUDINARY_FOLDER = 'aajexam/pyq/ssc-cpo-{date_slug}';
const F = '{date_slug}';

const examCategorySchema = new mongoose.Schema({{
  name: {{ type: String, required: true, trim: true }},
  type: {{ type: String, enum: ['Central', 'State'], required: true }},
  description: {{ type: String, trim: true }}
}}, {{ timestamps: true }});

const examSchema = new mongoose.Schema({{
  category: {{ type: mongoose.Schema.Types.ObjectId, ref: 'ExamCategory', required: true }},
  name: {{ type: String, required: true, trim: true }},
  code: {{ type: String, required: true, uppercase: true, trim: true }},
  description: {{ type: String, trim: true }},
  isActive: {{ type: Boolean, default: true }},
  logo: {{ type: String }}
}}, {{ timestamps: true }});

const examPatternSchema = new mongoose.Schema({{
  exam: {{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true }},
  title: {{ type: String, required: true, trim: true }},
  duration: {{ type: Number, required: true, min: 1 }},
  totalMarks: {{ type: Number, required: true, min: 0 }},
  negativeMarking: {{ type: Number, default: 0, min: 0 }},
  sections: [{{
    name: {{ type: String, required: true, trim: true }},
    totalQuestions: {{ type: Number, required: true, min: 1 }},
    marksPerQuestion: {{ type: Number, required: true, min: 0 }},
    negativePerQuestion: {{ type: Number, default: 0, min: 0 }},
    sectionDuration: {{ type: Number, min: 0 }}
  }}]
}}, {{ timestamps: true }});

const practiceTestSchema = new mongoose.Schema({{
  examPattern: {{ type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true }},
  title: {{ type: String, required: true, trim: true }},
  slug: {{ type: String, lowercase: true, trim: true }},
  totalMarks: {{ type: Number, required: true, min: 0 }},
  duration: {{ type: Number, required: true, min: 1 }},
  accessLevel: {{ type: String, enum: ['FREE', 'PRO'], default: 'FREE' }},
  isPYQ: {{ type: Boolean, default: false }},
  pyqYear: {{ type: Number, default: null }},
  pyqShift: {{ type: String, default: null, trim: true }},
  pyqExamName: {{ type: String, default: null, trim: true }},
  publishedAt: {{ type: Date, default: Date.now }},
  questions: [{{
    questionText: {{ type: String, required: true }},
    questionImage: {{ type: String, default: '' }},
    options: [{{ type: String, required: true }}],
    optionImages: [{{ type: String, default: '' }}],
    correctAnswerIndex: {{ type: Number, required: true, min: 0 }},
    explanation: {{ type: String, trim: true }},
    section: {{ type: String, required: true, trim: true }},
    tags: [{{ type: String, trim: true }}],
    difficulty: {{ type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' }}
  }}]
}}, {{ timestamps: true }});

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const REA = 'General Intelligence and Reasoning';
const GA  = 'General Awareness';
const QA  = 'Quantitative Aptitude';
const ENG = 'English Language';

const KEY = {KEY};
const RAW = [
{RAW_JS}
];

if (RAW.length !== 200) {{ console.error(`Expected 200, got ${{RAW.length}}`); process.exit(1); }}
if (KEY.length !== 200) {{ console.error(`KEY length ${{KEY.length}}`); process.exit(1); }}

const uploadCache = new Map();
async function uploadImage(fileName, publicId) {{
  if (!fileName) return '';
  if (uploadCache.has(fileName)) return uploadCache.get(fileName);
  const localPath = path.join(EXTRACTED_DIR, fileName);
  if (!fs.existsSync(localPath)) {{
    console.log(`  [missing] ${{fileName}}`);
    uploadCache.set(fileName, '');
    return '';
  }}
  try {{
    const res = await cloudinary.uploader.upload(localPath, {{
      folder: CLOUDINARY_FOLDER, public_id: publicId, overwrite: true, resource_type: 'image'
    }});
    uploadCache.set(fileName, res.secure_url);
    return res.secure_url;
  }} catch (err) {{
    console.error(`  [upload failed] ${{fileName}}: ${{err.message}}`);
    uploadCache.set(fileName, '');
    return '';
  }}
}}

async function buildQuestions() {{
  const questions = [];
  for (let i = 0; i < RAW.length; i++) {{
    const r = RAW[i];
    const n = r.n;
    let qImage = '';
    let optImages = ['', '', '', ''];
    if (r.qi) {{
      process.stdout.write(`Q${{n}} q-img... `);
      qImage = await uploadImage(r.qi, `${{F}}-q-${{n}}`);
      console.log(qImage ? 'ok' : 'missing');
    }}
    for (let oi = 0; oi < 4; oi++) {{
      if (r.oi[oi]) {{
        process.stdout.write(`  Q${{n}} opt-${{oi+1}}-img... `);
        optImages[oi] = await uploadImage(r.oi[oi], `${{F}}-q-${{n}}-option-${{oi+1}}`);
        console.log(optImages[oi] ? 'ok' : 'missing');
      }}
    }}
    questions.push({{
      questionText: r.q || '(Question text unavailable — see image)',
      questionImage: qImage,
      options: r.o.map(o => o || '(image option)'),
      optionImages: optImages,
      correctAnswerIndex: KEY[i] - 1,
      explanation: r.e || '',
      section: r.s,
      tags: ['SSC', 'CPO', 'Tier-I', 'Paper-I', 'PYQ', '2017'],
      difficulty: 'medium'
    }});
  }}
  return questions;
}}

async function seed() {{
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\\n');

  let category = await ExamCategory.findOne({{ name: 'Central', type: 'Central' }});
  if (!category) {{
    category = await ExamCategory.create({{ name: 'Central', type: 'Central', description: 'Central government competitive exams' }});
  }}

  let exam = await Exam.findOne({{ code: 'SSC-CPO' }});
  if (!exam) {{
    exam = await Exam.create({{
      category: category._id,
      name: 'SSC CPO (Sub-Inspector Delhi Police / CAPF)',
      code: 'SSC-CPO',
      description: 'Staff Selection Commission - Sub-Inspector in Delhi Police and Central Armed Police Forces Examination',
      isActive: true
    }});
    console.log('Created Exam: SSC-CPO');
  }}

  const PATTERN_TITLE = 'SSC CPO Tier-I (Paper-I)';
  let pattern = await ExamPattern.findOne({{ exam: exam._id, title: PATTERN_TITLE }});
  if (!pattern) {{
    pattern = await ExamPattern.create({{
      exam: exam._id, title: PATTERN_TITLE, duration: 120, totalMarks: 200, negativeMarking: 0.25,
      sections: [
        {{ name: REA, totalQuestions: 50, marksPerQuestion: 1, negativePerQuestion: 0.25 }},
        {{ name: GA,  totalQuestions: 50, marksPerQuestion: 1, negativePerQuestion: 0.25 }},
        {{ name: QA,  totalQuestions: 50, marksPerQuestion: 1, negativePerQuestion: 0.25 }},
        {{ name: ENG, totalQuestions: 50, marksPerQuestion: 1, negativePerQuestion: 0.25 }}
      ]
    }});
    console.log('Created ExamPattern: SSC CPO Tier-I (Paper-I)');
  }}

  const TEST_TITLE = '{test_title}';
  await PracticeTest.deleteMany({{ examPattern: pattern._id, title: TEST_TITLE }});

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({{
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 120,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2017, pyqShift: '{test_title.split("Shift-")[1] if "Shift-" in test_title else ""}',
    pyqExamName: 'SSC CPO Tier-I (Paper-I)', questions
  }});
  console.log(`\\nCreated PracticeTest: ${{test._id}} (${{test.questions.length}} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}}

seed().catch(err => {{ console.error('Seed failed:', err); process.exit(1); }});
'''

with open(out_js, 'w', encoding='utf-8') as f:
    f.write(JS)
print(f"Wrote {out_js}")
