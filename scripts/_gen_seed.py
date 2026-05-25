"""Generate a seed-pyq-ssc-ssp-*.js from _questions_<slug>.json.

Usage: _gen_seed.py <slug> <level> <date-slug> <test-title> <output-js>
  slug:         e.g. jul24_2025_s1
  level:        MAT | HS | GRAD
  date-slug:    e.g. 24-jul-2025-s1
  test-title:   PracticeTest.title
  output-js:    path to write the JS file
"""
import sys
import json
import os

if len(sys.argv) < 6:
    print(__doc__)
    sys.exit(1)

slug, level, date_slug, test_title, out_js = sys.argv[1:6]

LEVEL_CFG = {
    'MAT':  {
        'exam_code': 'SSC-SSP-MAT', 'exam_name': 'SSC Selection Post (Matriculation Level)',
        'pattern_title': 'SSC Selection Post (Matriculation Level)',
        'level_label': 'Matriculation'
    },
    'HS': {
        'exam_code': 'SSC-SSP-HS', 'exam_name': 'SSC Selection Post (Higher Secondary Level)',
        'pattern_title': 'SSC Selection Post (Higher Secondary Level)',
        'level_label': 'Higher Secondary'
    },
    'GRAD': {
        'exam_code': 'SSC-SSP', 'exam_name': 'SSC Selection Post (Graduate Level)',
        'pattern_title': 'SSC Selection Post (Graduate Level)',
        'level_label': 'Graduate'
    }
}
cfg = LEVEL_CFG[level]

with open(f'_questions_{slug}.json', encoding='utf-8') as f:
    qs = json.load(f)

if len(qs) != 100:
    print(f"WARN: expected 100 questions, got {len(qs)}")

# Section assignment: REA(1-25) GA(26-50) QA(51-75) ENG(76-100)
def section_for(n):
    if n <= 25:
        return 'General Intelligence'
    if n <= 50:
        return 'General Awareness'
    if n <= 75:
        return 'Quantitative Aptitude'
    return 'English Language'

def js_str(s):
    # Escape backticks and backslashes for template literals
    s = s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    return f"`{s}`"

# Build KEY array
KEY = [{'A': 1, 'B': 2, 'C': 3, 'D': 4}[q['answer']] for q in qs]

# Build RAW array
raw_items = []
for q in qs:
    sec = section_for(q['n'])
    item = f"  {{ s: {js_str(sec)}, q: {js_str(q['q'])}, o: [{js_str(q['opts'][0])}, {js_str(q['opts'][1])}, {js_str(q['opts'][2])}, {js_str(q['opts'][3])}], e: {js_str(q['sol'][:800])} }}"
    raw_items.append(item)
RAW_JS = ',\n'.join(raw_items)

JS = f'''/**
 * Seed: {test_title}
 * Source: Adda247 Similar Paper docx/PDF.
 * Section order: REA(1-25) → GA(26-50) → QA(51-75) → ENG(76-100). 100Q × 2 = 200 marks, 60 min, 0.5 neg.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import {{ fileURLToPath }} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({{ path: path.resolve(__dirname, '../.env.local') }});
dotenv.config({{ path: path.resolve(__dirname, '../.env') }});

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {{ console.error('MONGO_URI not found'); process.exit(1); }}

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

const REA = 'General Intelligence';
const ENG = 'English Language';
const QA  = 'Quantitative Aptitude';
const GA  = 'General Awareness';

const KEY = {KEY};
if (KEY.length !== 100) {{ console.error(`KEY length ${{KEY.length}}`); process.exit(1); }}

const RAW = [
{RAW_JS}
];

if (RAW.length !== 100) {{ console.error(`Expected 100 questions, got ${{RAW.length}}`); process.exit(1); }}

async function seed() {{
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  let category = await ExamCategory.findOne({{ name: 'Central', type: 'Central' }});
  if (!category) {{
    category = await ExamCategory.create({{ name: 'Central', type: 'Central', description: 'Central government competitive exams' }});
  }}

  let exam = await Exam.findOne({{ code: '{cfg["exam_code"]}' }});
  if (!exam) {{
    exam = await Exam.create({{
      category: category._id,
      name: '{cfg["exam_name"]}',
      code: '{cfg["exam_code"]}',
      description: 'Staff Selection Commission - Selection Post ({cfg["level_label"]} Level)',
      isActive: true
    }});
  }}

  const PATTERN_TITLE = '{cfg["pattern_title"]}';
  let pattern = await ExamPattern.findOne({{ exam: exam._id, title: PATTERN_TITLE }});
  if (!pattern) {{
    pattern = await ExamPattern.create({{
      exam: exam._id, title: PATTERN_TITLE, duration: 60, totalMarks: 200, negativeMarking: 0.5,
      sections: [
        {{ name: REA, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }},
        {{ name: GA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }},
        {{ name: QA,  totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }},
        {{ name: ENG, totalQuestions: 25, marksPerQuestion: 2, negativePerQuestion: 0.5 }}
      ]
    }});
  }}

  const TEST_TITLE = '{test_title}';
  await PracticeTest.deleteMany({{ examPattern: pattern._id, title: TEST_TITLE }});

  const questions = RAW.map((r, i) => ({{
    questionText: r.q,
    questionImage: '',
    options: r.o,
    optionImages: ['', '', '', ''],
    correctAnswerIndex: KEY[i] - 1,
    explanation: r.e || '',
    section: r.s,
    tags: ['SSC', 'Selection Post', 'Phase XIII', '{cfg["level_label"]}', 'PYQ', '2025', 'Similar Paper'],
    difficulty: 'medium'
  }}));

  const test = await PracticeTest.create({{
    examPattern: pattern._id, title: TEST_TITLE, totalMarks: 200, duration: 60,
    accessLevel: 'FREE', isPYQ: true, pyqYear: 2025, pyqShift: '{test_title.split("Shift-")[1].split(" ")[0] if "Shift-" in test_title else ""}',
    pyqExamName: 'SSC Selection Post Phase XIII ({cfg["level_label"]}) - Similar Paper', questions
  }});
  console.log(`Created PYQ PracticeTest: ${{test._id}} (${{test.questions.length}} questions)`);

  await mongoose.disconnect();
  console.log('Done.');
}}

seed().catch(err => {{ console.error('Seed failed:', err); process.exit(1); }});
'''

with open(out_js, 'w', encoding='utf-8') as f:
    f.write(JS)

print(f"Wrote {out_js}")
