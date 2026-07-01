# -*- coding: utf-8 -*-
"""Generate seed-pyq-rajasthan-police-2001.js from rjp2001.json (Hindi PYQ).
NEW exam: creates Exam RJ-POL-CONST (reuse State category) + ExamPattern
'Rajasthan Police Written Exam' if absent. 100 Q single GK section, Hindi medium.
"""
import json, io, os

SRC = r'C:\Users\USER\AppData\Local\Temp\claude\d--Sazid-Github\d6554e60-b505-4ac2-96de-c1da3fa08fd4\scratchpad\rjp2001.json'
OUT = os.path.join(os.path.dirname(__file__), 'seed-pyq-rajasthan-police-2001.js')

data = json.load(io.open(SRC, encoding='utf-8'))
raw = []
for q in data:
    opts = [o for o in q['options'] if o.strip() != '']   # drop empty (Q4 4th option)
    ans0 = q['answerIndex'] - 1                              # 1-based -> 0-based
    assert 0 <= ans0 < len(opts), f"Q{q['qno']} answer {q['answerIndex']} out of range after cleanup"
    raw.append({'n': q['qno'], 's': 'General Knowledge', 'q': q['question'], 'o': opts, 'a': ans0})

raw_js = json.dumps(raw, ensure_ascii=False, indent=2)

js = '''/**
 * Seed: Rajasthan Police Constable - 2001 (Hindi)
 * NEW state-level exam. 100 Q x 1 mark, single General Knowledge section, no
 * negative marking. Hindi-medium PYQ (questions/options kept in Devanagari,
 * verbatim from the Prepp scan; answer key printed inline as ( N ) per question).
 * Source PDF used legacy Devanagari fonts (no ToUnicode) -> questions recovered
 * by vision OCR of the rendered pages. Q4 printed only 3 options in the source.
 * Reuses existing Exam `RJ-POL-CONST` (ExamCategory State) + ExamPattern
 * 'Written Test' (section 'General Knowledge'); both pre-exist in the DB.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not found'); process.exit(1); }

const examCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Central', 'State'], required: true },
  slug: { type: String, lowercase: true, trim: true },
  description: { type: String, trim: true }
}, { timestamps: true });
const examSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamCategory', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  slug: { type: String, lowercase: true, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
const examPatternSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  title: { type: String, required: true, trim: true },
  duration: { type: Number }, totalMarks: { type: Number }, negativeMarking: { type: Number },
  sections: [{ name: String, totalQuestions: Number, marksPerQuestion: Number,
    negativePerQuestion: Number, sectionDuration: Number }]
}, { timestamps: true });
const practiceTestSchema = new mongoose.Schema({
  examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, lowercase: true, trim: true },
  totalMarks: { type: Number, required: true }, duration: { type: Number, required: true },
  accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  isPYQ: { type: Boolean, default: false }, pyqYear: { type: Number, default: null },
  pyqShift: { type: String, default: null }, pyqExamName: { type: String, default: null },
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
    difficulty: { type: String, enum: ['easy','medium','hard','mixed'], default: 'medium' }
  }]
}, { timestamps: true });

const ExamCategory = mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = ["Rajasthan Police", "Constable", "PYQ", "2001", "Hindi", "Rajasthan Police Constable - 2001"];
const RAW = __RAW__;

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\\n');

  // Reuse existing State ExamCategory (never create per-exam categories)
  let category = await ExamCategory.findOne({ type: 'State' });
  if (!category) {
    category = await ExamCategory.create({ name: 'State', type: 'State', slug: 'state',
      description: 'State government competitive exams' });
    console.log('Created ExamCategory: State');
  }

  // Create Exam RJ-POL-CONST on first run
  let exam = await Exam.findOne({ code: 'RJ-POL-CONST' });
  if (!exam) {
    exam = await Exam.create({ category: category._id, name: 'Rajasthan Police Constable',
      code: 'RJ-POL-CONST', slug: slugify('Rajasthan Police Constable'),
      description: 'Rajasthan Police Constable Recruitment Examination', isActive: true });
    console.log('Created Exam: RJ-POL-CONST');
  }

  // Reuse the existing ExamPattern 'Written Test' (has a 'General Knowledge' section)
  const PATTERN_TITLE = 'Written Test';
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: PATTERN_TITLE });
  if (!pattern) throw new Error(`ExamPattern "${PATTERN_TITLE}" not found for RJ-POL-CONST — aborting.`);

  const TEST_TITLE = "Rajasthan Police Constable - 2001";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: 100, duration: 120, accessLevel: 'FREE', isPYQ: true, pyqYear: 2001,
    pyqShift: TEST_TITLE, pyqExamName: 'Rajasthan Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
'''

js = js.replace('__RAW__', raw_js)
io.open(OUT, 'w', encoding='utf-8').write(js)
print('wrote', OUT, 'with', len(raw), 'questions')
