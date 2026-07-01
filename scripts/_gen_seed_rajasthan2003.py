# -*- coding: utf-8 -*-
"""Generate seed-pyq-rajasthan-police-2003.js from rjp2003.json (Hindi PYQ).
Reuses Exam RJ-POL-CONST + ExamPattern 'Written Test' (section 'General Knowledge').
98 of 100 Qs (Q33 & Q68 unrecoverable — fell in gaps between scanned pages).
14 answers derived from GK (source answer column clipped off page edge): see ansSrc.
"""
import json, io, os

SRC = r'C:\Users\USER\AppData\Local\Temp\claude\d--Sazid-Github\d6554e60-b505-4ac2-96de-c1da3fa08fd4\scratchpad\rjp2003.json'
OUT = os.path.join(os.path.dirname(__file__), 'seed-pyq-rajasthan-police-2003.js')

data = json.load(io.open(SRC, encoding='utf-8'))
raw = []
for q in data:
    opts = [o for o in q['options'] if o.strip() != '']
    ans0 = q['answerIndex'] - 1
    assert 0 <= ans0 < len(opts), f"src {q['src']} answer out of range"
    raw.append({'n': q['src'], 's': 'General Knowledge', 'q': q['question'], 'o': opts, 'a': ans0})

raw_js = json.dumps(raw, ensure_ascii=False, indent=2)

js = '''/**
 * Seed: Rajasthan Police Constable - 2003 (Hindi)
 * State-level exam PYQ. 98 of 100 Q (Q33 & Q68 unrecoverable — they fell in the
 * gaps between the photographed pages of the source scan). Single General
 * Knowledge section, no negative marking. Hindi-medium, verbatim Devanagari from
 * the Prepp "Solved Paper" scan. Source had NO text layer (pure images) ->
 * questions recovered by vision OCR of rendered pages. 14 answers (Q34-43, Q69-72)
 * were derived from general knowledge because the answer column was physically
 * clipped off the right edge of the tilted scan. Reuses Exam `RJ-POL-CONST` +
 * ExamPattern 'Written Test'.
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

const examSchema = new mongoose.Schema({
  category: mongoose.Schema.Types.ObjectId, name: String, code: String
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

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = ["Rajasthan Police", "Constable", "PYQ", "2003", "Hindi", "Rajasthan Police Constable - 2003"];
const RAW = __RAW__;

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\\n');

  const exam = await Exam.findOne({ code: 'RJ-POL-CONST' });
  if (!exam) throw new Error('Exam RJ-POL-CONST not found — aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Written Test' });
  if (!pattern) throw new Error('ExamPattern "Written Test" not found — aborting.');

  const TEST_TITLE = "Rajasthan Police Constable - 2003";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: questions.length, duration: 120, accessLevel: 'FREE', isPYQ: true, pyqYear: 2003,
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
