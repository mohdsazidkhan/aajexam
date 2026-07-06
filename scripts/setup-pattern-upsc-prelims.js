import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const ExamSchema = new mongoose.Schema({ name: String, slug: String });
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

        const upsc = await Exam.findOne({ slug: 'upsc-prelims' });
        if (!upsc) {
            console.log('Error: UPSC Prelims Exam not found in DB.');
            process.exit(1);
        }
        console.log('Found UPSC Exam:', upsc._id);

        // Pattern 1: GS Paper I
        const p1Title = 'UPSC Prelims - General Studies (Paper I)';
        let p1 = await ExamPattern.findOne({ exam: upsc._id, title: p1Title });
        if (p1) {
            console.log('Pattern already exists:', p1Title);
        } else {
            p1 = await ExamPattern.create({
                exam: upsc._id,
                title: p1Title,
                duration: 120, // 2 hours
                totalMarks: 200,
                negativeMarking: 0.33,
                sections: [{
                    name: 'General Studies',
                    totalQuestions: 100,
                    marksPerQuestion: 2,
                    negativePerQuestion: 0.66,
                    sectionDuration: 120
                }]
            });
            console.log('Created Pattern:', p1Title, '| ID:', p1._id);
        }

        // Pattern 2: CSAT Paper II
        const p2Title = 'UPSC Prelims - CSAT (Paper II)';
        let p2 = await ExamPattern.findOne({ exam: upsc._id, title: p2Title });
        if (p2) {
            console.log('Pattern already exists:', p2Title);
        } else {
            p2 = await ExamPattern.create({
                exam: upsc._id,
                title: p2Title,
                duration: 120, // 2 hours
                totalMarks: 200,
                negativeMarking: 0.33,
                sections: [{
                    name: 'CSAT (Aptitude)',
                    totalQuestions: 80,
                    marksPerQuestion: 2.5,
                    negativePerQuestion: 0.83,
                    sectionDuration: 120
                }]
            });
            console.log('Created Pattern:', p2Title, '| ID:', p2._id);
        }

        console.log('\nDone! Pattern IDs:');
        console.log('GS Paper I  :', p1._id);
        console.log('CSAT Paper II:', p2._id);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
