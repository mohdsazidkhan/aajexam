import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Exam = mongoose.models.Exam || mongoose.model('Exam',
    new mongoose.Schema({ name: String, code: String, slug: String }));
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern',
    new mongoose.Schema({
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
    }));

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const exam = await Exam.findOne({ $or: [{ code: /^NEET$/i }, { name: /^NEET$/i }] });
    if (!exam) { console.error('NEET exam not found'); process.exit(1); }
    console.log('Found NEET exam:', exam._id);

    const patterns = [
        { title: 'NEET (UG)', duration: 180, totalMarks: 720, sections: [
            { name: 'Physics', totalQuestions: 45, marksPerQuestion: 4, negativePerQuestion: 1, sectionDuration: 180 },
            { name: 'Chemistry', totalQuestions: 45, marksPerQuestion: 4, negativePerQuestion: 1, sectionDuration: 180 },
            { name: 'Biology', totalQuestions: 90, marksPerQuestion: 4, negativePerQuestion: 1, sectionDuration: 180 }
        ] },
        // 2021 onwards: 200 questions (Section A 35 + Section B 15 per subject), attempt 180, 720 marks
        { title: 'NEET (UG) 2021 Onwards', duration: 200, totalMarks: 720, sections: [
            { name: 'Physics', totalQuestions: 50, marksPerQuestion: 4, negativePerQuestion: 1, sectionDuration: 200 },
            { name: 'Chemistry', totalQuestions: 50, marksPerQuestion: 4, negativePerQuestion: 1, sectionDuration: 200 },
            { name: 'Botany', totalQuestions: 50, marksPerQuestion: 4, negativePerQuestion: 1, sectionDuration: 200 },
            { name: 'Zoology', totalQuestions: 50, marksPerQuestion: 4, negativePerQuestion: 1, sectionDuration: 200 }
        ] }
    ];
    for (const spec of patterns) {
        let p = await ExamPattern.findOne({ exam: exam._id, title: spec.title });
        if (p) { console.log('Pattern already exists:', spec.title, '| ID:', p._id); continue; }
        p = await ExamPattern.create({ exam: exam._id, negativeMarking: 1, ...spec });
        console.log('Created Pattern:', spec.title, '| ID:', p._id);
    }
    await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
