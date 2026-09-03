import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function backfillExams() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');
  
  const Exam = mongoose.connection.collection('exams');
  
  // Set actualExam to true for all exams where actualExam is not explicitly false
  const res = await Exam.updateMany(
    { actualExam: { $ne: false } },
    { $set: { actualExam: true } }
  );
  
  console.log(`Backfilled ${res.modifiedCount} exams to actualExam: true`);
  
  await mongoose.disconnect();
}

backfillExams().catch(console.error);
