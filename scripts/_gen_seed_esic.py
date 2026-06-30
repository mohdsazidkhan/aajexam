#!/usr/bin/env python3
"""Generate a seed-pyq JS file for an ESIC UDC Prelims paper from its parsed
_esic_<slug>.json. Reuses the existing Exam `ESIC-UDC-P` + ExamPattern
'Prelims CBT' (never creates them). 5 options/question, no images (the
Adda247 memory-based source has none — all figures are ads; DI tables are text).

Usage: python scripts/_gen_seed_esic.py <slug> <date-slug> "<Title>" <year> <totalMarks>
  e.g. python scripts/_gen_seed_esic.py esic2019 esic2019 "ESIC UDC Prelims - Memory Based 2019" 2019 150
Outputs scripts/seed-pyq-esic-<date-slug>.js
"""
import json, sys

SLUG, DATESLUG, TITLE, YEAR, TOTALMARKS = sys.argv[1:6]
data = json.load(open(f'_esic_{SLUG}.json', encoding='utf-8'))

def js(s):
    return json.dumps(s, ensure_ascii=False)

raw_lines = []
for q in data:
    o = "[" + ", ".join(js(x) for x in q['options']) + "]"
    raw_lines.append(
        f"  {{ n: {q['n']}, s: {js(q['section'])}, q: {js(q['q'])}, "
        f"o: {o}, a: {q['ans']}, e: {js(q.get('sol',''))} }}"
    )
RAW = ",\n".join(raw_lines)

TAGS = ['ESIC', 'UDC', 'Prelims', 'PYQ', str(YEAR), 'Memory Based', TITLE]
tags_js = "[" + ", ".join(js(t) for t in TAGS) + "]"

out = f'''/**
 * Seed: {TITLE}
 * Adda247 memory-based ESIC UDC Prelims. 5 options/Q, no images (DI tables are
 * text). Reuses Exam `ESIC-UDC-P` + ExamPattern 'Prelims CBT'. Sections present:
 * Reasoning / Quantitative Aptitude / English (no General Awareness in the
 * memory-based source). Answer key + solutions from the official Solutions PDF.
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

  const exam = await Exam.findOne({{ code: 'ESIC-UDC-P' }});
  if (!exam) throw new Error('Exam ESIC-UDC-P not found — aborting.');
  const pattern = await ExamPattern.findOne({{ exam: exam._id, title: 'Prelims CBT' }});
  if (!pattern) throw new Error('ExamPattern "Prelims CBT" not found — aborting.');

  const TEST_TITLE = {js(TITLE)};
  await PracticeTest.deleteMany({{ examPattern: pattern._id, title: TEST_TITLE }});

  const nMark = pattern.negativeMarking ?? 0.25;
  const questions = RAW.map(r => ({{
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: r.e || '', section: r.s, tags: TAGS, difficulty: 'medium'
  }}));

  const test = await PracticeTest.create({{
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: {TOTALMARKS}, duration: 60, accessLevel: 'FREE', isPYQ: true, pyqYear: {YEAR},
    pyqShift: TEST_TITLE, pyqExamName: 'ESIC UDC Prelims', questions
  }});
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}}
seed().catch(err => {{ console.error('Seed failed:', err); process.exit(1); }});
'''

fn = f"scripts/seed-pyq-esic-{DATESLUG}.js"
open(fn, 'w', encoding='utf-8').write(out)
print(f"wrote {fn}: {len(data)} Q")
