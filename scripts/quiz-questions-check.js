import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const chsl = await db.collection('exams').findOne({ code: 'SSC-CHSL-T1' });
console.log('CHSL _id:', chsl._id);

// Sample quiz for CHSL
const quiz = await db.collection('quizzes').findOne({
  applicableExams: chsl._id,
  status: 'published',
});
console.log('\nSample CHSL quiz:', quiz.title);
console.log('  questions count:', quiz.questions?.length);
console.log('  subject ref:', quiz.subject);
console.log('  applicableExams:', quiz.applicableExams.map(String));

// Count questions referenced by CHSL-applicable quizzes
const chslQuizzes = await db.collection('quizzes')
  .find({ applicableExams: chsl._id, status: 'published' })
  .project({ questions: 1 }).toArray();
const allQIds = new Set();
chslQuizzes.forEach(q => (q.questions || []).forEach(qid => allQIds.add(String(qid))));
console.log(`\nCHSL has ${chslQuizzes.length} quizzes → ${allQIds.size} unique Question refs`);

// Now how many of those are real Questions in DB?
const ids = Array.from(allQIds).slice(0, 5000).map(id => new mongoose.Types.ObjectId(id));
const foundCount = await db.collection('questions').countDocuments({ _id: { $in: ids } });
console.log(`Questions actually present in DB: ${foundCount} / ${allQIds.size}`);

// Group found questions by exam tag
const byExam = await db.collection('questions').aggregate([
  { $match: { _id: { $in: ids } } },
  { $group: { _id: '$exam', count: { $sum: 1 } } },
  { $lookup: { from: 'exams', localField: '_id', foreignField: '_id', as: 'e' } },
  { $unwind: '$e' },
  { $project: { _id: 0, exam: '$e.code', count: 1 } }
]).toArray();
console.log('\nCHSL-referenced questions by exam-tag:');
byExam.forEach(r => console.log(`  ${r.count} tagged as ${r.exam}`));

// By subject
const bySubj = await db.collection('questions').aggregate([
  { $match: { _id: { $in: ids } } },
  { $group: { _id: '$subject', count: { $sum: 1 } } },
  { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 's' } },
  { $unwind: '$s' },
  { $project: { _id: 0, subject: '$s.name', count: 1 } },
  { $sort: { count: -1 } }
]).toArray();
console.log('\nBy subject:');
bySubj.forEach(r => console.log(`  ${String(r.count).padStart(4)}  ${r.subject}`));

// Sample a real CHSL-referenced question
const sampleQ = await db.collection('questions').findOne({ _id: { $in: ids } });
console.log('\nSample question:');
console.log('  text:', sampleQ?.questionText?.slice(0, 120));
console.log('  options:');
(sampleQ?.options || []).forEach((o, i) => console.log(`    [${i}] ${o.isCorrect ? '✓' : ' '} ${(o.text || '').slice(0, 80)}`));
console.log('  language:', sampleQ?.language, '  difficulty:', sampleQ?.difficulty);
console.log('  explanation len:', (sampleQ?.explanation || '').length);

await mongoose.disconnect();
