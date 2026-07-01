# -*- coding: utf-8 -*-
"""Generate seed-pyq-rajasthan-police-YYYY.js for 2007/2008/2010/2013/2014.

Reads per-page extraction JSON from the scratchpad, assembles each paper
(handling section-restart numbering + page-boundary duplicate questions),
applies solver patches (recovered options / derived answers) and drops
(figure-only or unrecoverable questions), and emits a seed JS that reuses the
existing Exam `RJ-POL-CONST` + ExamPattern 'Written Test' (section
'General Knowledge'). All questions kept in Hindi (Devanagari) verbatim.

Inline-answer papers (2008/2010/2013/2014): answer printed as ( N ) per Q.
Separate-key paper (2007): answers come from the उत्तरमाला key pages.
"""
import json, io, os

SCR = r'C:\Users\USER\AppData\Local\Temp\claude\d--Sazid-Github\d6554e60-b505-4ac2-96de-c1da3fa08fd4\scratchpad'
OUTDIR = os.path.dirname(__file__)

def load(f):
    p = os.path.join(SCR, f)
    return json.load(io.open(p, encoding='utf-8')) if os.path.exists(p) else None

def assemble(prefix, pages):
    """Concatenate page arrays in order; split blocks on qno reset; dedup
    consecutive same-qno page-boundary repeats (keep the richer copy)."""
    seq = []; block = 0; prev = None
    for pg in pages:
        arr = load(f'{prefix}{pg}.json')
        if arr is None:
            raise SystemExit(f'missing {prefix}{pg}.json')
        for q in arr:
            qno = q.get('qno')
            if qno is None:
                continue
            if prev is not None and qno < prev and qno <= 5:
                block += 1
            item = {'qno': qno, 'question': q.get('question', ''),
                    'options': list(q.get('options', [])),
                    'answerIndex': q.get('answerIndex'), 'page': pg, 'block': block}
            if seq and seq[-1]['block'] == block and seq[-1]['qno'] == qno:
                # page-boundary duplicate: MERGE (stem may be on one page, options on next)
                old = seq[-1]
                old_q = old['question'] if (old['question'] and str(old['question']).strip()) else item['question']
                old_opts = old['options'] if len([o for o in old['options'] if o]) >= \
                    len([o for o in item['options'] if o]) else item['options']
                old_ans = old['answerIndex'] if old['answerIndex'] is not None else item['answerIndex']
                old['question'], old['options'], old['answerIndex'] = old_q, old_opts, old_ans
                prev = qno
                continue
            seq.append(item)
            prev = qno
    return seq

def apply_solved(seq, solved):
    """Patch by (qno,page): drop / set options / set answerIndex."""
    if not solved:
        return
    idx = {(s['qno'], s['page']): s for s in solved}
    for it in seq:
        s = idx.get((it['qno'], it['page']))
        if not s:
            continue
        if s.get('drop') or s.get('isFigure'):
            it['_drop'] = True
        if s.get('options'):
            it['options'] = list(s['options'])
        if s.get('answerIndex') is not None:
            it['answerIndex'] = s['answerIndex']

def finalize(seq, section='General Knowledge'):
    """Drop broken/figure Qs; remap answer index across empty options; 0-base."""
    raw = []; dropped = []
    for it in seq:
        if it.get('_drop'):
            dropped.append((it['block'], it['qno'], 'flagged')); continue
        if not (it['question'] and str(it['question']).strip()):
            dropped.append((it['block'], it['qno'], 'no-question')); continue
        # figure-dependent questions (count shapes in a diagram / Venn-region) whose
        # figure is not captured -> unanswerable as text, drop
        FIGDEP = ['कितने त्रिभुज', 'कितने आयत', 'कितने वर्ग हैं', 'कितने वृत्त', 'चित्र में A', 'आकृति में कितने']
        if any(s in it['question'] for s in FIGDEP):
            dropped.append((it['block'], it['qno'], 'figure-dependent')); continue
        opts = it['options']; ans1 = it['answerIndex']
        pos = [i for i, o in enumerate(opts) if o and str(o).strip()]
        if ans1 is None:
            dropped.append((it['block'], it['qno'], 'no-answer')); continue
        if len(pos) < 2:
            dropped.append((it['block'], it['qno'], 'no-options')); continue
        a0 = ans1 - 1
        if a0 not in pos:
            dropped.append((it['block'], it['qno'], f'ans{ans1}-empty')); continue
        new_opts = [opts[i] for i in pos]
        new_a = pos.index(a0)
        raw.append({'n': it['qno'], 's': section, 'q': it['question'],
                    'o': new_opts, 'a': new_a})
    return raw, dropped

TEMPLATE = '''/**
 * Seed: Rajasthan Police Constable - __YEAR__ (Hindi)
 * State-level exam PYQ, __N__ questions, single General Knowledge section, no
 * negative marking. Hindi-medium, verbatim Devanagari from the Prepp "Solved
 * Paper" scan (legacy fonts -> recovered by vision OCR of rendered pages).
 * __NOTE__
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

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

const TAGS = __TAGS__;
const RAW = __RAW__;

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\\n');

  const exam = await Exam.findOne({ code: 'RJ-POL-CONST' });
  if (!exam) throw new Error('Exam RJ-POL-CONST not found - aborting.');
  const pattern = await ExamPattern.findOne({ exam: exam._id, title: 'Written Test' });
  if (!pattern) throw new Error('ExamPattern "Written Test" not found - aborting.');

  const TEST_TITLE = "Rajasthan Police Constable - __YEAR__";
  await PracticeTest.deleteMany({ examPattern: pattern._id, title: TEST_TITLE });

  const questions = RAW.map(r => ({
    questionText: r.q, questionImage: '', options: r.o,
    optionImages: r.o.map(() => ''), correctAnswerIndex: r.a,
    explanation: '', section: r.s, tags: TAGS, difficulty: 'medium'
  }));

  const test = await PracticeTest.create({
    examPattern: pattern._id, title: TEST_TITLE, slug: slugify(TEST_TITLE),
    totalMarks: questions.length, duration: 120, accessLevel: 'FREE', isPYQ: true, pyqYear: __YEAR__,
    pyqShift: TEST_TITLE, pyqExamName: 'Rajasthan Police Constable', questions
  });
  console.log('Created PracticeTest:', String(test._id), '(' + test.questions.length + ' questions)');
  await mongoose.disconnect();
  console.log('Done.');
}
seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
'''

def emit(year, raw, note):
    tags = ["Rajasthan Police", "Constable", "PYQ", str(year), "Hindi",
            f"Rajasthan Police Constable - {year}"]
    js = (TEMPLATE
          .replace('__RAW__', json.dumps(raw, ensure_ascii=False, indent=2))
          .replace('__TAGS__', json.dumps(tags, ensure_ascii=False))
          .replace('__YEAR__', str(year))
          .replace('__N__', str(len(raw)))
          .replace('__NOTE__', note))
    out = os.path.join(OUTDIR, f'seed-pyq-rajasthan-police-{year}.js')
    io.open(out, 'w', encoding='utf-8').write(js)
    print(f'wrote {out} with {len(raw)} questions')


def build_inline(year, prefix, pages, solved_file, note):
    seq = assemble(prefix, pages)
    apply_solved(seq, load(solved_file))
    raw, dropped = finalize(seq)
    print(f'{year}: kept {len(raw)}, dropped {len(dropped)} -> {dropped}')
    emit(year, raw, note)


def build_2007():
    # questions have NO inline answers; merge separate key pages
    seq = assemble('rp2007_q', [f'{i:02d}' for i in range(0, 15)])
    key = {}
    for i in range(14, 18):
        arr = load(f'rp2007_k{i:02d}.json') or []
        for e in arr:
            q, a = e.get('qno'), e.get('ans')
            if q and a and 1 <= a <= 4:
                key.setdefault(q, a)
    key.setdefault(20, 4)  # उपर्युक्त सभी (key omitted; derived)
    for it in seq:
        it['answerIndex'] = key.get(it['qno'])
        if it['qno'] == 15:  # "निम्नांकित आकृति में कितने त्रिभुज है?" — figure not captured
            it['_drop'] = True
    raw, dropped = finalize(seq)
    print(f'2007: kept {len(raw)}, dropped {len(dropped)} -> {dropped}')
    emit(2007, raw, 'Answers from the printed उत्तरमाला answer key. Figure-based '
                    'questions (diagram/series options) omitted.')


if __name__ == '__main__':
    build_inline(2008, 'rp2008_p', [f'{i:02d}' for i in range(0, 14)], 'rp2008_solved.json',
                 'Answers printed inline as ( N ); a few clipped-edge answers were derived. '
                 '2 questions omitted (missing options / undeterminable answer).')
    build_inline(2010, 'rp2010_p', [f'{i:02d}' for i in range(1, 17)], 'rp2010_solved.json',
                 'Three sections (reasoning/GK/Rajasthan-GK); answers printed inline as ( N ). '
                 'Figure-only questions omitted.')
    build_inline(2013, 'rp2013_p', [f'{i:02d}' for i in range(0, 17)], 'rp2013_solved.json',
                 'Three sections; answers printed inline as ( N ). Figure-only questions omitted.')
    build_inline(2014, 'rp2014_p', [f'{i:02d}' for i in range(0, 18)], 'rp2014_solved.json',
                 'Continuous 1-120; answers printed inline as ( N ). Figure-only questions omitted.')
    build_2007()
