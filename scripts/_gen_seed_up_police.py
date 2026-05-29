"""Generate seed JS for UP Police Constable paper.

Reads _questions_<slug>.json (from _parse_up_police.py) and produces a Node.js seed that:
  1. Uploads images from _extracted_<slug>/ to Cloudinary at aajexam/pyq/up-police-constable-<date-slug>/
  2. Creates UP-POLICE-CON Exam (State category) + UP Police Constable ExamPattern
     (150 Q × 2 marks = 300, 4 sections × 38/37/38/37, 120 min total, 0.5 neg)
  3. Inserts PracticeTest with 150 questions and 4 options each

Usage: _gen_seed_up_police.py <slug> <date-slug> <pyq-year> <pyq-shift> <test-title> <output-js>
"""
import sys, json, os

NUM_QS = 150
NUM_OPTS = 4

if len(sys.argv) < 7:
    print(__doc__)
    sys.exit(1)

slug, date_slug, pyq_year, pyq_shift, test_title, out_js = sys.argv[1:7]
pyq_year = int(pyq_year)

with open(f'_questions_{slug}.json', encoding='utf-8') as f:
    qs = json.load(f)

if len(qs) != NUM_QS:
    print(f"WARNING: expected {NUM_QS}, got {len(qs)} entries")
    while len(qs) < NUM_QS:
        n = len(qs) + 1
        qs.append({'n': n, 'section': 'Numerical & Mental Ability', 'q': '', 'q_image': '',
                   'opts': [''] * NUM_OPTS, 'opt_images': [''] * NUM_OPTS, 'answer': 'A', 'sol': ''})
    qs = qs[:NUM_QS]

def js_str(s):
    s = (s or '').replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    return f"`{s}`"

KEY = [{'A': 1, 'B': 2, 'C': 3, 'D': 4}.get(q['answer'], 1) for q in qs]

raw_items = []
for q in qs:
    sec = q.get('section') or 'Numerical & Mental Ability'
    opts = q.get('opts', [''] * NUM_OPTS)
    opt_imgs = q.get('opt_images', [''] * NUM_OPTS)
    while len(opts) < NUM_OPTS: opts.append('')
    while len(opt_imgs) < NUM_OPTS: opt_imgs.append('')
    item = (
        f"  {{ n: {q['n']}, s: {js_str(sec)}, "
        f"q: {js_str(q.get('q',''))}, qi: {js_str(q.get('q_image',''))}, "
        f"o: [{js_str(opts[0])}, {js_str(opts[1])}, {js_str(opts[2])}, {js_str(opts[3])}], "
        f"oi: [{js_str(opt_imgs[0])}, {js_str(opt_imgs[1])}, {js_str(opt_imgs[2])}, {js_str(opt_imgs[3])}], "
        f"e: {js_str((q.get('sol') or '')[:1500])} }}"
    )
    raw_items.append(item)
RAW_JS = ',\n'.join(raw_items)

shift_clause = f"pyqShift: `{pyq_shift}`," if pyq_shift else "pyqShift: null,"
year_tag = str(pyq_year)
shift_tag = f", '{pyq_shift}'" if pyq_shift else ""

JS = f'''/**
 * Seed: {test_title}
 * UP Police Constable (Uttar Pradesh Police Recruitment & Promotion Board).
 * 150 Q × 2 marks = 300 marks, 4 sections (GK 38 / Hindi 37 / Numerical 38 / Reasoning 37),
 * 120 min total, 0.5 negative marking per wrong answer.
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
const CLOUDINARY_FOLDER = 'aajexam/pyq/up-police-constable-{date_slug}';
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

const GK  = 'General Knowledge';
const HIN = 'General Hindi';
const NUM = 'Numerical & Mental Ability';
const REA = 'Mental Aptitude / Reasoning';

const KEY = {KEY};
const RAW = [
{RAW_JS}
];

if (RAW.length !== 150) {{ console.error(`Expected 150, got ${{RAW.length}}`); process.exit(1); }}
if (KEY.length !== 150) {{ console.error(`KEY length ${{KEY.length}}`); process.exit(1); }}

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
      tags: ['UP Police', 'Constable', 'PYQ', '{year_tag}'{shift_tag}],
      difficulty: 'medium'
    }});
  }}
  return questions;
}}

async function seed() {{
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\\n');

  // UP Police Constable is a State exam — reuse the existing 'State' ExamCategory
  // (per feedback_examcategory_reuse: never create per-state categories).
  let category = await ExamCategory.findOne({{ name: 'State', type: 'State' }});
  if (!category) {{
    category = await ExamCategory.create({{ name: 'State', type: 'State', description: 'State government competitive exams' }});
  }}

  let exam = await Exam.findOne({{ code: 'UP-POLICE-CON' }});
  if (!exam) {{
    exam = await Exam.create({{
      category: category._id,
      name: 'UP Police Constable',
      code: 'UP-POLICE-CON',
      description: 'Uttar Pradesh Police Recruitment & Promotion Board - Constable Direct Recruitment Examination',
      isActive: true
    }});
    console.log('Created Exam: UP-POLICE-CON');
  }}

  const PATTERN_TITLE = 'UP Police Constable';
  let pattern = await ExamPattern.findOne({{ exam: exam._id, title: PATTERN_TITLE }});
  if (!pattern) {{
    pattern = await ExamPattern.create({{
      exam: exam._id, title: PATTERN_TITLE, duration: 120, totalMarks: 300, negativeMarking: 0.5,
      sections: [
        {{ name: GK,  totalQuestions: 38, marksPerQuestion: 2, negativePerQuestion: 0.5 }},
        {{ name: HIN, totalQuestions: 37, marksPerQuestion: 2, negativePerQuestion: 0.5 }},
        {{ name: NUM, totalQuestions: 38, marksPerQuestion: 2, negativePerQuestion: 0.5 }},
        {{ name: REA, totalQuestions: 37, marksPerQuestion: 2, negativePerQuestion: 0.5 }}
      ]
    }});
    console.log('Created ExamPattern: UP Police Constable');
  }}

  const TEST_TITLE = `{test_title}`;
  await PracticeTest.deleteMany({{ examPattern: pattern._id, title: TEST_TITLE }});

  console.log('Building questions (uploading images)...');
  const questions = await buildQuestions();

  const test = await PracticeTest.create({{
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 300, duration: 120,
    accessLevel: 'FREE', isPYQ: true, pyqYear: {pyq_year}, {shift_clause}
    pyqExamName: 'UP Police Constable', questions
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
