# -*- coding: utf-8 -*-
"""Generate seed-pyq-rajasthan-police-2020-*.js for the Nov-2020 shifts.

Six papers held 6/7/8 Nov 2020 (Rajasthan Police Constable Recruitment 2019),
each 150 questions. Sources are Prepp "Solved Paper" PDFs:
  - 5 shifts (06 S2, 07 S1/S2, 08 S1/S2) use the KrutiDev010 legacy font with a
    plain-text answer key on the last page -> decoded deterministically
    (see krutidev2.py) by _parse_kruti; answers from the AnsKey table.
  - 06 S1 uses a broken-ToUnicode font (garbled extraction) -> question text
    recovered by vision OCR of the rendered pages; answers taken deterministically
    from the RED-coloured correct option in the PDF text layer.

Figure-dependent questions (venn/mirror/dice/cube/non-verbal series/image options)
are dropped. All Hindi kept verbatim (Devanagari). Reuses existing Exam
`RJ-POL-CONST` + ExamPattern 'Written Test', single 'General Knowledge' section.
"""
import json, io, os

SCR = r'C:\Users\USER\AppData\Local\Temp\claude\d--Sazid-Github\b0f0889e-6c1a-4028-b45f-8c637d7094f7\scratchpad'
OUTDIR = os.path.dirname(__file__)

SHIFTS = {
    # tag : (json-file, date-label, shift-label)
    '06s1': ('06s1_final.json', '06 Nov 2020', 'Shift 1'),
    '06s2': ('06s2.json', '06 Nov 2020', 'Shift 2'),
    '07s1': ('07s1.json', '07 Nov 2020', 'Shift 1'),
    '07s2': ('07s2.json', '07 Nov 2020', 'Shift 2'),
    '08s1': ('08s1.json', '08 Nov 2020', 'Shift 1'),
    '08s2': ('08s2.json', '08 Nov 2020', 'Shift 2'),
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
        # answer's option must be non-empty; remap index across any empty options
        if not (q['options'][a] and str(q['options'][a]).strip()):
            dropped.append((q['qno'], 'answer-empty')); continue
        new_a = opts.index(q['options'][a])
        raw.append({'n': q['qno'], 's': section, 'q': q['question'].strip(),
                    'o': opts, 'a': new_a})
    return raw, dropped


TEMPLATE = r'''/**
 * Seed: Rajasthan Police Constable - __TITLEDATE__ __SHIFT__ (Hindi)
 * State-level exam PYQ, __N__ questions, single General Knowledge section, no
 * negative marking. Hindi-medium, verbatim Devanagari from the Prepp "Solved
 * Paper" PDF. __NOTE__
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
    totalMarks: questions.length, duration: 120, accessLevel: 'FREE', isPYQ: true, pyqYear: 2020,
    pyqShift: TEST_TITLE, pyqExamName: 'Rajasthan Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
'''


def emit(tag, titledate, shift, raw, note):
    year = 2020
    tags = ["Rajasthan Police", "Constable", "PYQ", str(year), "Hindi",
            f"Rajasthan Police Constable - {titledate} {shift}"]
    js = (TEMPLATE
          .replace('__RAW__', json.dumps(raw, ensure_ascii=False, indent=2))
          .replace('__TAGS__', json.dumps(tags, ensure_ascii=False))
          .replace('__TITLEDATE__', titledate)
          .replace('__SHIFT__', shift)
          .replace('__N__', str(len(raw)))
          .replace('__NOTE__', note))
    suffix = tag.replace('06', '06-nov-').replace('07', '07-nov-').replace('08', '08-nov-')
    out = os.path.join(OUTDIR, f'seed-pyq-rajasthan-police-2020-{suffix}.js')
    io.open(out, 'w', encoding='utf-8').write(js)
    print(f'wrote {out}  ({len(raw)} questions)')


KRUTI_NOTE = ('KrutiDev010 legacy font decoded to Unicode; answers from the '
              'printed last-page answer key. Figure-based questions omitted.')
S1_NOTE = ('Question text recovered by vision OCR of the rendered pages (broken '
           'font); answers from the red-marked correct option. Figure-based questions omitted.')

if __name__ == '__main__':
    import sys
    only = sys.argv[1:] or list(SHIFTS)
    for tag in only:
        fn, titledate, shift = SHIFTS[tag]
        p = os.path.join(SCR, fn)
        if not os.path.exists(p):
            print(f'SKIP {tag}: {fn} not found'); continue
        qs = json.load(io.open(p, encoding='utf-8'))
        raw, dropped = build_raw(qs)
        note = S1_NOTE if tag == '06s1' else KRUTI_NOTE
        print(f'{tag}: kept {len(raw)}, dropped {len(dropped)} -> {dropped}')
        emit(tag, titledate, shift, raw, note)
