/**
 * Verify all 8 SSC MTS 2021 (8 Oct shifts) PYQ PracticeTests in the DB.
 * Run: node scripts/_verify_mts21.js
 * Checks: each test exists, 100 questions, 25 per section, every Q has 4 options,
 * a valid correctAnswerIndex, and reports how many carry a questionImage.
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

const PracticeTest = mongoose.model('PracticeTest', new mongoose.Schema({}, { strict: false }));

const TITLES = [
  'SSC MTS (2019 Pattern) - 2021 (5 Oct) Shift-1',
  'SSC MTS (2019 Pattern) - 2021 (5 Oct) Shift-2',
  'SSC MTS (2019 Pattern) - 2021 (6 Oct) Shift-1',
  'SSC MTS (2019 Pattern) - 2021 (6 Oct) Shift-2',
  'SSC MTS (2019 Pattern) - 2021 (7 Oct) Shift-1',
  'SSC MTS (2019 Pattern) - 2021 (7 Oct) Shift-2',
  'SSC MTS (2019 Pattern) - 2021 (7 Oct) Shift-3',
  'SSC MTS (2019 Pattern) - 2021 (8 Oct) Shift-1',
];
const SECTIONS = ['General English', 'General Intelligence & Reasoning', 'Numerical Aptitude', 'General Awareness'];

await mongoose.connect(MONGO_URI);
console.log('Connected.\n');

let allOk = true;
for (const title of TITLES) {
  const t = await PracticeTest.findOne({ title }).lean();
  if (!t) { console.log(`❌ MISSING: ${title}`); allOk = false; continue; }
  const qs = t.questions || [];
  const probs = [];
  if (qs.length !== 100) probs.push(`count=${qs.length}`);
  const secCount = {};
  let imgs = 0;
  qs.forEach((q, i) => {
    secCount[q.section] = (secCount[q.section] || 0) + 1;
    if (!Array.isArray(q.options) || q.options.length !== 4) probs.push(`Q${i + 1} opts=${q.options?.length}`);
    if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) probs.push(`Q${i + 1} ans=${q.correctAnswerIndex}`);
    if (q.questionImage) imgs++;
  });
  for (const s of SECTIONS) if (secCount[s] !== 25) probs.push(`${s}=${secCount[s] || 0}`);
  const flags = { isPYQ: t.isPYQ, pyqYear: t.pyqYear, shift: t.pyqShift };
  if (!t.isPYQ || t.pyqYear !== 2021) probs.push(`flags=${JSON.stringify(flags)}`);
  if (probs.length) { console.log(`❌ ${title}\n   ${probs.join(', ')}`); allOk = false; }
  else console.log(`✅ ${title}  (100 Q, 25/sec, ${imgs} imgs, shift "${t.pyqShift}")`);
}

console.log(allOk ? '\nAll 8 OK.' : '\nPROBLEMS found.');
await mongoose.disconnect();
