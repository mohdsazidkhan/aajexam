#!/usr/bin/env python3
"""Generate a seed-pyq JS file for a Haryana Police Constable paper from a parsed
_hr_final.json (records: n, q, options[4], ansLetter, ansIdx, section). Reuses the
existing Exam `HR-POL-CONST` + ExamPattern 'Haryana Police Written Exam' (never
creates them). 4 options/question, no images, no negative marking.

Usage: python scripts/_gen_seed_haryana.py <final-json> <date-slug> "<Title>" <year> <totalMarks>
  e.g. python scripts/_gen_seed_haryana.py _hr_final.json 23dec2018 "Haryana Police Constable - 23 Dec 2018" 2018 100
Outputs scripts/seed-pyq-haryana-<date-slug>.js
"""
import json, sys

FINAL, DATESLUG, TITLE, YEAR, TOTALMARKS = sys.argv[1:6]
data = json.load(open(FINAL, encoding='utf-8'))

def js(s):
    return json.dumps(s, ensure_ascii=False)

raw_lines = []
for q in data:
    o = "[" + ", ".join(js(x) for x in q['options']) + "]"
    raw_lines.append(
        f"  {{ n: {q['n']}, s: {js(q['section'])}, q: {js(q['q'])}, "
        f"o: {o}, a: {q['ansIdx']} }}"
    )
RAW = ",\n".join(raw_lines)

TAGS = ['Haryana Police', 'Constable', 'PYQ', str(YEAR), TITLE]
tags_js = "[" + ", ".join(js(t) for t in TAGS) + "]"

out = f'''/**
 * Seed: {TITLE}
 * Haryana Police Constable written exam (scanned bilingual paper, English version
 * seeded). 100 Q x 1 mark, 4 options, no negative marking. Reuses Exam
 * `HR-POL-CONST` + ExamPattern 'Haryana Police Written Exam'. The scan carried no
 * official key (only unreliable hand-marks) -> answers derived by independent
 * solving; Haryana-state-specific GK falls back to the scan marks.
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

async function seed() {{
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\\n');

  const exam = await Exam.findOne({{ code: 'HR-POL-CONST' }});
  if (!exam) throw new Error('Exam HR-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({{ exam: exam._id, title: 'Haryana Police Written Exam' }});
  if (!pattern) throw new Error('ExamPattern "Haryana Police Written Exam" not found — aborting.');

  const TEST_TITLE = {js(TITLE)};
  await PracticeTest.deleteMany({{ examPattern: pattern._id, title: TEST_TITLE }});

  const questions = RAW.map(r => ({{
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }}));

  const test = await PracticeTest.create({{
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: {TOTALMARKS}, duration: 90, accessLevel: 'FREE', isPYQ: true, pyqYear: {YEAR},
    pyqShift: TEST_TITLE, pyqExamName: 'Haryana Police Constable', questions
  }});
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}}
seed().catch(err => {{ console.error('Seed failed:', err); process.exit(1); }});
'''

fn = f"scripts/seed-pyq-haryana-{DATESLUG}.js"
open(fn, 'w', encoding='utf-8').write(out)
print(f"wrote {fn}: {len(data)} Q")
