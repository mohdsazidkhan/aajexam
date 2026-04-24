import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const exams = await db.collection('exams').find({}).project({ code: 1 }).sort({ code: 1 }).toArray();

// Global list of all subjects
const allSubjects = await db.collection('subjects').find({}).project({ name: 1 }).toArray();
console.log(`Global subjects (${allSubjects.length}):`);
allSubjects.forEach(s => console.log(`  ${s._id}  ${s.name}`));

console.log('\n' + '='.repeat(80));
console.log('Per-exam unique-question pool via published quizzes:');
console.log('='.repeat(80));

for (const e of exams) {
  const quizzes = await db.collection('quizzes')
    .find({ applicableExams: e._id, status: 'published' })
    .project({ questions: 1 }).toArray();

  const qIds = new Set();
  quizzes.forEach(q => (q.questions || []).forEach(id => qIds.add(String(id))));
  const idArr = Array.from(qIds).map(s => new mongoose.Types.ObjectId(s));

  const bySubj = await db.collection('questions').aggregate([
    { $match: { _id: { $in: idArr } } },
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 's' } },
    { $unwind: '$s' },
    { $project: { _id: 0, subject: '$s.name', count: 1 } },
    { $sort: { count: -1 } }
  ]).toArray();

  console.log(`\n${e.code}  (${quizzes.length} quizzes, ${qIds.size} unique Qs)`);
  bySubj.forEach(s => console.log(`  ${String(s.count).padStart(4)}  ${s.subject}`));
}

await mongoose.disconnect();
