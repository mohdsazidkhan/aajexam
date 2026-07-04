import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

// Load Minimal Models
const ExamSchema = new mongoose.Schema({ name: String, code: String });
const Exam = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);

const ExamPatternSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    title: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 0 },
    negativeMarking: { type: Number, default: 0, min: 0 },
    sections: [{
        name: { type: String, required: true, trim: true },
        totalQuestions: { type: Number, required: true, min: 1 },
        marksPerQuestion: { type: Number, required: true, min: 0 },
        negativePerQuestion: { type: Number, default: 0, min: 0 },
        sectionDuration: { type: Number, min: 0 }
    }]
});
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', ExamPatternSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const cil = await Exam.findOne({ name: /CIL/i });
    if (!cil) {
      console.log('Error: CIL Exam not found in database. Please seed Exam first.');
      process.exit(1);
    }

    const patternTitle = 'CIL Management Trainee (MT)';
    const existingPattern = await ExamPattern.findOne({ exam: cil._id, title: patternTitle });
    
    if (existingPattern) {
      console.log('Pattern already exists:', existingPattern.title);
    } else {
      console.log('Creating Exam Pattern for CIL MT...');
      const newPattern = await ExamPattern.create({
        exam: cil._id,
        title: patternTitle,
        duration: 180, // 3 hours
        totalMarks: 200,
        negativeMarking: 0, // usually no negative marking in CIL MT, or 0.25, setting 0
        sections: [
          {
            name: 'Paper I (General Knowledge/Awareness, Reasoning, Numerical Ability & English)',
            totalQuestions: 100,
            marksPerQuestion: 1,
            negativePerQuestion: 0
          },
          {
            name: 'Paper II (Professional Knowledge)',
            totalQuestions: 100,
            marksPerQuestion: 1,
            negativePerQuestion: 0
          }
        ]
      });
      console.log('Created Pattern Successfully:', newPattern._id);
    }
  } catch (error) {
    console.error('Failed to setup pattern:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
