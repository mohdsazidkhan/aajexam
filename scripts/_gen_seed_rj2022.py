# -*- coding: utf-8 -*-
"""Generate seed-pyq-rajasthan-police-2022-*.js for the 2022 shifts.

Seven Prepp question papers (Rajasthan Police Constable Recruitment 2021, held
May/July 2022), each 150 questions. The source PDFs are QUESTION-ONLY (no answer
key anywhere) and use a broken-conjunct CID font (6 May papers) or are image-only
scans (02 July) -> question text recovered by vision OCR of the rendered pages;
answers derived by solver agents (no official key exists for these papers).

Figure-dependent questions (venn/mirror/dice/cube/non-verbal series/image options,
count-the-shapes) are dropped. All Hindi kept verbatim (Devanagari). Reuses
existing Exam `RJ-POL-CONST` + ExamPattern 'Written Test', single
'General Knowledge' section.

Input: one JSON file per paper, a list of
  {"qno":int,"question":str,"options":[str,...],"answerIndex":int(0-based),"figure":bool}
"""
import json, io, os

SCR = r'C:\Users\USER\AppData\Local\Temp\claude\d--Sazid-Github\9f3429d8-364a-4377-9561-51a03f4e8f92\scratchpad'
OUTDIR = os.path.dirname(__file__)

SHIFTS = {
    # tag : (json-file, date-label, shift-label, out-suffix)
    '13s1': ('rp22_13s1_final.json', '13 May 2022', 'Shift 1', '13-may-s1'),
    '13s2': ('rp22_13s2_final.json', '13 May 2022', 'Shift 2', '13-may-s2'),
    '14':   ('rp22_14_final.json',   '14 May 2022', 'Shift 1', '14-may-s1'),
    '15s1': ('rp22_15s1_final.json', '15 May 2022', 'Shift 1', '15-may-s1'),
    '15s2': ('rp22_15s2_final.json', '15 May 2022', 'Shift 2', '15-may-s2'),
    '16':   ('rp22_16_final.json',   '16 May 2022', 'Shift 2', '16-may-s2'),
    'jul02':('rp22_jul02_final.json','02 July 2022','Shift 1', '02-jul-s1'),
}


def build_raw(qs, section='General Knowledge'):
    raw, dropped = [], []
    for q in qs:
        if q.get('figure'):
            dropped.append((q['qno'], 'figure')); continue
        opts = [o for o in q['options'] if o and str(o).strip()]
        a = q.get('answerIndex')
        if not (q.get('question') and str(q['question']).strip()):
            dropped.append((q['qno'], 'no-question')); continue
        if len(opts) < 2:
            dropped.append((q['qno'], 'few-options')); continue
        if a is None or a < 0 or a >= len(q['options']):
            dropped.append((q['qno'], 'bad-answer')); continue
        if not (q['options'][a] and str(q['options'][a]).strip()):
            dropped.append((q['qno'], 'answer-empty')); continue
        new_a = opts.index(q['options'][a])
        raw.append({'n': q['qno'], 's': section, 'q': q['question'].strip(),
                    'o': opts, 'a': new_a})
    return raw, dropped


TEMPLATE = r'''/**
 * Seed: Rajasthan Police Constable - __TITLEDATE__ __SHIFT__ (Hindi)
 * State-level exam PYQ, __N__ questions, single General Knowledge section, no
 * negative marking. Hindi-medium, verbatim Devanagari from the Prepp question
 * paper (question-only source, no official answer key). Question text recovered
 * by vision OCR; answers derived by solver. Figure-based questions omitted.
 * Reuses existing Exam `RJ-POL-CONST` + ExamPattern 'Written Test'.
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

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = __TAGS__;
const RAW = __RAW__;

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  const exam = await Exam.findOne({ code: 'RJ-POL-CONST' });
  if (!exam) throw new Error('Exam RJ-POL-CONST not found - aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Written Test' });
  if (!pattern) throw new Error('ExamPattern "Written Test" not found - aborting.');

  const TEST_TITLE = "Rajasthan Police Constable - __TITLEDATE__ __SHIFT__";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: questions.length, duration: 120, accessLevel: 'FREE', isPYQ: true, pyqYear: 2022,
    pyqShift: TEST_TITLE, pyqExamName: 'Rajasthan Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
'''


def emit(tag, titledate, shift, suffix, raw):
    year = 2022
    tags = ["Rajasthan Police", "Constable", "PYQ", str(year), "Hindi",
            f"Rajasthan Police Constable - {titledate} {shift}"]
    js = (TEMPLATE
          .replace('__RAW__', json.dumps(raw, ensure_ascii=False, indent=2))
          .replace('__TAGS__', json.dumps(tags, ensure_ascii=False))
          .replace('__TITLEDATE__', titledate)
          .replace('__SHIFT__', shift)
          .replace('__N__', str(len(raw))))
    out = os.path.join(OUTDIR, f'seed-pyq-rajasthan-police-2022-{suffix}.js')
    io.open(out, 'w', encoding='utf-8').write(js)
    print(f'wrote {out}  ({len(raw)} questions)')


if __name__ == '__main__':
    import sys
    only = sys.argv[1:] or list(SHIFTS)
    for tag in only:
        fn, titledate, shift, suffix = SHIFTS[tag]
        p = os.path.join(SCR, fn)
        if not os.path.exists(p):
            print(f'SKIP {tag}: {fn} not found'); continue
        qs = json.load(io.open(p, encoding='utf-8'))
        raw, dropped = build_raw(qs)
        print(f'{tag}: kept {len(raw)}, dropped {len(dropped)} -> {dropped}')
        emit(tag, titledate, shift, suffix, raw)
