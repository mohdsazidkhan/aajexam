import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

console.log('=== 20 Exams ===');
const exams = await db.collection('exams').find({})
  .project({ code: 1, name: 1 }).sort({ code: 1 }).toArray();
exams.forEach(e => console.log(`  ${e.code.padEnd(16)} ${e.name}`));

console.log('\n=== Quiz count by subject (across all 755 quizzes) ===');
const bySubj = await db.collection('quizzes').aggregate([
  { $group: { _id: '$subject', count: { $sum: 1 } } },
  { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'sub' } },
  { $unwind: '$sub' },
  { $project: { _id: 0, subject: '$sub.name', count: 1 } },
  { $sort: { count: -1 } }
]).toArray();
bySubj.forEach(s => console.log(`  ${String(s.count).padStart(4)}  ${s.subject}`));

console.log('\n=== Top 30 topics by quiz count ===');
const byTopic = await db.collection('quizzes').aggregate([
  { $match: { topic: { $ne: null } } },
  { $group: { _id: '$topic', count: { $sum: 1 } } },
  { $lookup: { from: 'topics', localField: '_id', foreignField: '_id', as: 't' } },
  { $unwind: '$t' },
  { $lookup: { from: 'subjects', localField: 't.subject', foreignField: '_id', as: 's' } },
  { $unwind: '$s' },
  { $project: { _id: 0, topic: '$t.name', subject: '$s.name', count: 1 } },
  { $sort: { count: -1 } },
  { $limit: 30 }
]).toArray();
byTopic.forEach(t => console.log(`  ${String(t.count).padStart(3)}  [${t.subject}] ${t.topic}`));

console.log(`\ntotal quizzes counted: ${bySubj.reduce((a, b) => a + b.count, 0)}`);
console.log(`total subjects with quizzes: ${bySubj.length}`);

await mongoose.disconnect();
