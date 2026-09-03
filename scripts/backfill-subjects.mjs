import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGO_URI = process.env.MONGO_URI;

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function backfill() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');
  
  const db = mongoose.connection;
  const exams = await db.collection('exams').find().toArray();
  
  for (const exam of exams) {
    let subjectsUpdated = 0;
    
    // 1. Gather subjects from Quizzes linked to this exam
    const quizzes = await db.collection('quizzes').find({ applicableExams: exam._id }).toArray();
    for (const quiz of quizzes) {
      if (quiz.subject) {
        await db.collection('subjects').updateOne(
          { _id: quiz.subject },
          { $addToSet: { exams: exam._id } }
        );
        subjectsUpdated++;
      }
    }
    
    // 2. Gather subjects from Practice Tests (sections) linked to this exam
    const patterns = await db.collection('exampatterns').find({ exam: exam._id }).toArray();
    const patternIds = patterns.map(p => p._id);
    
    if (patternIds.length > 0) {
      const tests = await db.collection('practicetests').find({ examPattern: { $in: patternIds } }).toArray();
      const sections = new Set();
      
      for (const test of tests) {
        for (const q of test.questions || []) {
          if (q.section) sections.add(q.section.trim());
        }
      }
      
      for (const sec of sections) {
        if (!sec) continue;
        
        // Find by name case-insensitively, or upsert
        const existing = await db.collection('subjects').findOne({ name: { $regex: new RegExp('^' + sec + '$', 'i') } });
        if (existing) {
          await db.collection('subjects').updateOne(
            { _id: existing._id },
            { $addToSet: { exams: exam._id } }
          );
        } else {
          const slug = slugify(sec) + '-' + Math.floor(Math.random() * 10000);
          await db.collection('subjects').insertOne({
            name: sec,
            slug: slug,
            exams: [exam._id],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            icon: 'BookOpen'
          });
        }
        subjectsUpdated++;
      }
    }
    
    console.log(`Exam: ${exam.name} - Processed/Linked Subjects count: ${subjectsUpdated}`);
  }
  
  await mongoose.disconnect();
  console.log('Done backfilling subjects.');
}

backfill().catch(console.error);
