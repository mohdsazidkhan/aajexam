import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const exams = await db.collection('exams').find({}).project({ code: 1, name: 1 }).sort({ code: 1 }).toArray();
const patterns = await db.collection('exampatterns').find({}).project({ exam: 1 }).toArray();
const byExam = new Map();
patterns.forEach(p => {
  const k = String(p.exam);
  if (!byExam.has(k)) byExam.set(k, []);
  byExam.get(k).push(p._id);
});

console.log('Exam Code'.padEnd(18) + 'Quiz'.padStart(8) + 'PYQ'.padStart(6) + 'Practice'.padStart(12));
console.log('-'.repeat(44));
let tQ = 0, tP = 0, tPT = 0;
for (const e of exams) {
  const pIds = byExam.get(String(e._id)) || [];
  const quiz = await db.collection('quizzes').countDocuments({ applicableExams: e._id, status: 'published' });
  const pyq = pIds.length ? await db.collection('practicetests').countDocuments({ examPattern: { $in: pIds }, isPYQ: true }) : 0;
  const pt = pIds.length ? await db.collection('practicetests').countDocuments({ examPattern: { $in: pIds }, isPYQ: { $ne: true } }) : 0;
  console.log(e.code.padEnd(18) + String(quiz).padStart(8) + String(pyq).padStart(6) + String(pt).padStart(12));
  tQ += quiz; tP += pyq; tPT += pt;
}
console.log('-'.repeat(44));
console.log('TOTAL'.padEnd(18) + String(tQ).padStart(8) + String(tP).padStart(6) + String(tPT).padStart(12));

await mongoose.disconnect();
