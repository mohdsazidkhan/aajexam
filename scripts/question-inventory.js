import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const totalQ = await db.collection('questions').countDocuments({});
const activeQ = await db.collection('questions').countDocuments({ isActive: true });
console.log(`DB-wide questions: ${totalQ}  active: ${activeQ}\n`);

const exams = await db.collection('exams').find({})
  .project({ code: 1 }).sort({ code: 1 }).toArray();

console.log('Active question bank per exam:');
for (const e of exams) {
  const n = await db.collection('questions').countDocuments({ exam: e._id, isActive: true });
  console.log(`  ${e.code.padEnd(16)} ${String(n).padStart(5)}`);
}

const chsl = await db.collection('exams').findOne({ code: 'SSC-CHSL-T1' });
const bySubj = await db.collection('questions').aggregate([
  { $match: { exam: chsl._id, isActive: true } },
  { $group: { _id: '$subject', count: { $sum: 1 } } },
  { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 's' } },
  { $unwind: '$s' },
  { $project: { _id: 0, subject: '$s.name', count: 1 } },
  { $sort: { count: -1 } }
]).toArray();
console.log('\nSSC-CHSL-T1 questions by subject:');
bySubj.forEach(s => console.log(`  ${String(s.count).padStart(5)}  ${s.subject}`));

const sample = await db.collection('questions').findOne({ exam: chsl._id, isActive: true });
console.log('\nSample question shape:');
console.log('  questionText:', (sample.questionText || '').slice(0, 100));
console.log('  options:');
(sample.options || []).forEach((o, i) => {
  console.log(`    [${i}] ${o.isCorrect ? '✓' : ' '} ${(o.text || '').slice(0, 60)}`);
});
console.log('  language:', sample.language, '  difficulty:', sample.difficulty);
console.log('  explanation length:', (sample.explanation || '').length);

await mongoose.disconnect();
