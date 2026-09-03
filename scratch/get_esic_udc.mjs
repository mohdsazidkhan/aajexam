import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function getEsicUdcDetails() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const Exam = mongoose.connection.collection('exams');
  const Subject = mongoose.connection.collection('subjects');
  const Topic = mongoose.connection.collection('topics');
  
  const exam = await Exam.findOne({ name: { $regex: /ESIC UDC/i } });
  if (!exam) {
    console.log("Exam not found!");
    process.exit(1);
  }
  
  console.log("Exam:", exam.name, exam._id);
  
  const subjects = await Subject.find({ examId: exam._id }).toArray();
  console.log(`\nSubjects (${subjects.length}):`);
  
  for (const sub of subjects) {
    const topics = await Topic.find({ subjectId: sub._id }).toArray();
    console.log(`- ${sub.name} (ID: ${sub._id})`);
    for (const t of topics) {
      console.log(`  * ${t.name} (ID: ${t._id})`);
    }
  }
  
  process.exit(0);
}

getEsicUdcDetails();
