import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Section -> subject-name list mapping per exam.
// Keys match ExamPattern.sections[].name exactly.
const SECTION_MAPS = {
  'ESIC-UDC-M': {
    'General Intelligence & Reasoning': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'General Awareness': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Current Affairs', 'Biology', 'Physics', 'Chemistry', 'Science & Technology'],
    'Quantitative Aptitude': ['Quantitative Aptitude', 'Mathematics', 'Advanced Maths', 'Data Interpretation'],
    'English Comprehension': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
  },
  'ESIC-UDC-P': {
    'General Intelligence & Reasoning': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'General Awareness': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Current Affairs', 'Biology', 'Physics', 'Chemistry', 'Science & Technology'],
    'Quantitative Aptitude': ['Quantitative Aptitude', 'Mathematics', 'Advanced Maths', 'Data Interpretation'],
    'English Comprehension': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
  },
  'HR-POL-CONST': {
    'General Studies': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy'],
    'General Science': ['General Science', 'Biology', 'Physics', 'Chemistry', 'Science & Technology'],
    'Current Affairs': ['Current Affairs'],
    'Reasoning': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'Numerical Ability': ['Quantitative Aptitude', 'Mathematics', 'Advanced Maths'],
    'Haryana GK': ['State Specific GK'],
  },
  'IBPS-CLK-M': {
    'General/Financial Awareness': ['Banking Awareness', 'Financial Awareness', 'Current Affairs', 'Economy', 'General Knowledge'],
    'General English': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
    'Reasoning Ability & Computer Aptitude': ['Reasoning Ability', 'Logical Reasoning', 'Computer Knowledge'],
    'Quantitative Aptitude': ['Quantitative Aptitude', 'Advanced Maths', 'Data Interpretation'],
  },
  'IBPS-CLK-P': {
    'English Language': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
    'Numerical Ability': ['Quantitative Aptitude', 'Mathematics', 'Advanced Maths'],
    'Reasoning Ability': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
  },
  'IBPS-PO-P': {
    'English Language': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
    'Quantitative Aptitude': ['Quantitative Aptitude', 'Advanced Maths', 'Data Interpretation'],
    'Reasoning Ability': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
  },
  'RJ-POL-CONST': {
    'Reasoning': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'General Knowledge': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science'],
    'Rajasthan GK': ['State Specific GK', 'General Knowledge'], // fallback to GK if state pool short
  },
  'RRB-GRD': {
    'General Science': ['General Science', 'Biology', 'Physics', 'Chemistry', 'Science & Technology'],
    'Mathematics': ['Mathematics', 'Quantitative Aptitude', 'Advanced Maths'],
    'General Intelligence & Reasoning': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'General Awareness & Current Affairs': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'Current Affairs'],
  },
  'RRB-NTPC-1': {
    'General Awareness': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Current Affairs', 'Biology', 'Physics', 'Chemistry', 'Science & Technology'],
    'Mathematics': ['Mathematics', 'Quantitative Aptitude', 'Advanced Maths'],
    'General Intelligence & Reasoning': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
  },
  'SBI-CLK-M': {
    'General/Financial Awareness': ['Banking Awareness', 'Financial Awareness', 'Current Affairs', 'Economy', 'General Knowledge'],
    'General English': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
    'Quantitative Aptitude': ['Quantitative Aptitude', 'Advanced Maths', 'Data Interpretation'],
    'Reasoning Ability & Computer Aptitude': ['Reasoning Ability', 'Logical Reasoning', 'Computer Knowledge'],
  },
  'SBI-CLK-P': {
    'English Language': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
    'Numerical Ability': ['Quantitative Aptitude', 'Mathematics', 'Advanced Maths'],
    'Reasoning Ability': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
  },
  'SSC-CPO': {
    'General Intelligence & Reasoning': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'General Knowledge': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Biology', 'Physics', 'Chemistry', 'Science & Technology', 'Current Affairs'],
    'Quantitative Aptitude': ['Quantitative Aptitude', 'Advanced Maths', 'Data Interpretation'],
    'English Comprehension': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
  },
  'SSC-DPC': {
    'General Knowledge / Current Affairs': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Current Affairs'],
    'Reasoning / Logical Ability': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'Numerical Ability (Quantitative Aptitude)': ['Quantitative Aptitude', 'Mathematics', 'Advanced Maths'],
    'Computer Awareness / Fundamentals': ['Computer Knowledge'],
  },
  'SSC-GD': {
    'General Intelligence & Reasoning': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'General Knowledge & General Awareness': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Current Affairs'],
    'Elementary Mathematics': ['Mathematics', 'Quantitative Aptitude'],
    'English/Hindi': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary', 'Hindi Language'],
  },
  'SSC-MTS': {
    'Numerical Ability': ['Mathematics', 'Quantitative Aptitude', 'Advanced Maths'],
    'Reasoning Ability': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'General Awareness': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Current Affairs', 'Biology', 'Physics', 'Chemistry', 'Science & Technology'],
    'English Language': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
  },
  'SSC-SP-12': {
    'General Intelligence': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'General Awareness': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Current Affairs', 'Biology', 'Physics', 'Chemistry', 'Science & Technology'],
    'Quantitative Aptitude': ['Quantitative Aptitude', 'Advanced Maths', 'Data Interpretation'],
    'English Language': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
  },
  'SSC-STENO': {
    'General Intelligence & Reasoning': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
    'General Awareness': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Current Affairs', 'Biology', 'Physics', 'Chemistry', 'Science & Technology'],
    'English Language & Comprehension': ['English Language', 'English Grammar', 'Comprehension', 'Vocabulary'],
  },
  'UP-POL-CONST': {
    'General Knowledge': ['General Knowledge', 'History', 'Geography', 'Polity & Governance', 'Economy', 'General Science'],
    'General Hindi': ['Hindi Language'],
    'Numerical & Mental Ability': ['Quantitative Aptitude', 'Mathematics', 'Advanced Maths'],
    'Reasoning & Mental Aptitude': ['Reasoning Ability', 'Logical Reasoning', 'Analytical Reasoning'],
  },
};

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// deterministic seed-able RNG so retries yield different samples
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeDifficulty(d) {
  const v = (d || 'medium').toLowerCase();
  if (['easy', 'medium', 'hard'].includes(v)) return v;
  return 'medium';
}

function toPTQuestion(q, sectionName) {
  const opts = (q.options || []).map(o => o.text || '');
  while (opts.length < 4) opts.push('');
  const correctIdx = q.options.findIndex(o => o.isCorrect);
  return {
    questionText: q.questionText,
    questionImage: q.image || '',
    options: opts.slice(0, 4),
    optionImages: ['', '', '', ''],
    correctAnswerIndex: correctIdx >= 0 ? correctIdx : 0,
    explanation: q.explanation || '',
    section: sectionName,
    tags: (q.tags || []).slice(0, 5),
    difficulty: normalizeDifficulty(q.difficulty),
  };
}

async function buildPoolForExam(db, examId) {
  const quizzes = await db.collection('quizzes')
    .find({ applicableExams: examId, status: 'published' })
    .project({ questions: 1 }).toArray();
  const ids = new Set();
  quizzes.forEach(q => (q.questions || []).forEach(id => ids.add(String(id))));
  const objIds = Array.from(ids).map(s => new mongoose.Types.ObjectId(s));
  const questions = await db.collection('questions')
    .find({ _id: { $in: objIds }, isActive: true })
    .toArray();
  return questions;
}

async function generatePracticeTest(db, examCode, opts = {}) {
  const exam = await db.collection('exams').findOne({ code: examCode });
  if (!exam) return { ok: false, reason: 'exam not found' };

  const patterns = await db.collection('exampatterns').find({ exam: exam._id }).toArray();
  if (patterns.length === 0) return { ok: false, reason: 'no pattern' };
  const pattern = patterns[0]; // we've cleaned to 1:1

  const sectionMap = SECTION_MAPS[examCode];
  if (!sectionMap) return { ok: false, reason: 'no SECTION_MAP entry' };

  const pool = await buildPoolForExam(db, exam._id);
  const bySubject = new Map();
  const subjectNameById = new Map();
  const subjectDocs = await db.collection('subjects').find({}).project({ name: 1 }).toArray();
  subjectDocs.forEach(s => subjectNameById.set(String(s._id), s.name));

  for (const q of pool) {
    const subName = subjectNameById.get(String(q.subject)) || 'Unknown';
    if (!bySubject.has(subName)) bySubject.set(subName, []);
    bySubject.get(subName).push(q);
  }

  // Determine existing PTs — avoid question overlap where possible
  const existingPTs = await db.collection('practicetests')
    .find({ examPattern: pattern._id }).project({ questions: 1 }).toArray();
  const usedTexts = new Set();
  existingPTs.forEach(pt => (pt.questions || []).forEach(q => usedTexts.add((q.questionText || '').trim())));

  const nextNumber = existingPTs.filter(pt => !pt.isPYQ).length + 1;

  const rng = mulberry32(Date.now() ^ Math.floor(Math.random() * 1e9));
  const ptQuestions = [];
  const sectionWarnings = [];

  for (const section of pattern.sections) {
    const need = section.totalQuestions;
    const subjectsForSection = sectionMap[section.name];
    if (!subjectsForSection) {
      sectionWarnings.push(`Section "${section.name}": no subject mapping`);
      continue;
    }
    let candidates = [];
    for (const sn of subjectsForSection) {
      candidates = candidates.concat(bySubject.get(sn) || []);
    }
    // Dedupe by _id
    const seen = new Set();
    candidates = candidates.filter(q => {
      const k = String(q._id);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    // Prefer questions NOT already used in existing PTs
    const fresh = candidates.filter(q => !usedTexts.has((q.questionText || '').trim()));
    const preferred = fresh.length >= need ? fresh : candidates;

    if (preferred.length < need) {
      sectionWarnings.push(`Section "${section.name}": only ${preferred.length} available, need ${need}`);
    }
    const picked = shuffle(preferred, rng).slice(0, need);
    picked.forEach(q => ptQuestions.push(toPTQuestion(q, section.name)));
    picked.forEach(q => usedTexts.add((q.questionText || '').trim()));
  }

  const totalExpected = pattern.sections.reduce((s, x) => s + x.totalQuestions, 0);
  if (ptQuestions.length !== totalExpected) {
    sectionWarnings.push(`Total questions: got ${ptQuestions.length}, expected ${totalExpected}`);
  }

  const stamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const doc = {
    examPattern: pattern._id,
    title: `${exam.name} – Practice Test - ${nextNumber} - ${stamp}`,
    totalMarks: pattern.totalMarks,
    duration: pattern.duration,
    accessLevel: 'FREE',
    isPYQ: false,
    pyqYear: null,
    pyqShift: null,
    pyqExamName: null,
    publishedAt: new Date(),
    questions: ptQuestions,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (opts.dryRun) {
    return { ok: true, dryRun: true, doc, warnings: sectionWarnings, qCount: ptQuestions.length };
  }

  const res = await db.collection('practicetests').insertOne(doc);
  return { ok: true, insertedId: res.insertedId, title: doc.title, qCount: ptQuestions.length, warnings: sectionWarnings };
}

// MAIN
await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const argExam = process.argv[2]; // specific exam code, or 'all'
const dryRun = process.argv.includes('--dry-run');
const targets = argExam && argExam !== 'all' ? [argExam] : Object.keys(SECTION_MAPS);

console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}  | Targets: ${targets.length}`);
console.log('-'.repeat(80));

const summary = [];
for (const code of targets) {
  process.stdout.write(`${code.padEnd(18)}`);
  try {
    const r = await generatePracticeTest(db, code, { dryRun });
    if (!r.ok) {
      console.log(`  ❌ ${r.reason}`);
      summary.push({ code, status: 'failed', reason: r.reason });
      continue;
    }
    const warn = r.warnings.length ? `  ⚠ ${r.warnings.length} warning(s)` : '';
    if (r.dryRun) {
      console.log(`  [dry] q=${r.qCount}  ${warn}`);
    } else {
      console.log(`  ✓ inserted  q=${r.qCount}  ${warn}`);
    }
    r.warnings.forEach(w => console.log(`      ${w}`));
    summary.push({ code, status: r.dryRun ? 'dry' : 'inserted', qCount: r.qCount, warnings: r.warnings });
  } catch (e) {
    console.log(`  💥 error: ${e.message}`);
    summary.push({ code, status: 'error', reason: e.message });
  }
}

console.log('\n' + '='.repeat(80));
console.log('SUMMARY:');
summary.forEach(s => console.log(`  ${s.code.padEnd(18)}  ${s.status}${s.qCount ? ` q=${s.qCount}` : ''}${s.reason ? ` — ${s.reason}` : ''}`));

await mongoose.disconnect();
