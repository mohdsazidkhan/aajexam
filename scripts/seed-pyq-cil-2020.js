import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const PracticeTestSchema = new mongoose.Schema({
    examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    totalMarks: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
    isPYQ: { type: Boolean, default: false },
    pyqYear: { type: Number, default: null },
    pyqShift: { type: String, default: null, trim: true },
    pyqExamName: { type: String, default: null, trim: true },
    questions: Array
});
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', PracticeTestSchema);

const ExamPatternSchema = new mongoose.Schema({ title: String });
const ExamPattern = mongoose.models.ExamPattern || mongoose.model('ExamPattern', ExamPatternSchema);

function cleanQuestions(questions) {
    return questions.map(q => {
        const prefixImg = img => img ? '/images/exams/cil/2020/' + img.split(',')[0].trim() : '';
        q.questionImage = prefixImg(q.questionImage);
        q.optionImages = q.optionImages.map(prefixImg);
        // Ensure options don't have empty strings if they don't have images
        for (let o=0; o<4; o++) {
            if (!q.options[o] && !q.optionImages[o]) q.options[o] = 'Option ' + (o+1);
        }
        return q;
    });
}

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const pattern = await ExamPattern.findOne({ title: /CIL Management Trainee/i });
        if (!pattern) {
            console.log('Error: CIL Exam Pattern not found.');
            process.exit(1);
        }

        const tests = [
            {
                title: 'CIL MT 2020 - Civil Paper',
                slug: 'cil-mt-2020-civil',
                file: '_parsed_cil2020_CIL-MT-Civil-2020-Paper.json'
            },
            {
                title: 'CIL MT 2020 - Electrical Paper (Feb 27)',
                slug: 'cil-mt-2020-electrical-feb27',
                file: '_parsed_cil2020_CIL-MT-Electrical-27-Feb-2020_Paper.json'
            },
            {
                title: 'CIL MT 2020 - Electrical Paper (Other)',
                slug: 'cil-mt-2020-electrical-other',
                file: '_parsed_cil2020_CIL-MT-Electrical_-2020-Paper.json'
            },
            {
                title: 'CIL MT 2020 - Mechanical Paper (Feb 27)',
                slug: 'cil-mt-2020-mechanical-feb27',
                file: '_parsed_cil2020_CIL-MT-Mechanical-27-Feb-2020_Paper.json'
            },
            {
                title: 'CIL MT 2020 - System CS Paper (Feb 27)',
                slug: 'cil-mt-2020-system-cs-feb27',
                file: '_parsed_cil2020_CIL-MT-System-CS-27-Feb-2020_Paper.json'
            }
        ];

        for (const test of tests) {
            const existing = await PracticeTest.findOne({ slug: test.slug });
            if (existing) {
                console.log('Already exists:', test.title);
                continue;
            }

            const dataPath = path.join(__dirname, test.file);
            if (!fs.existsSync(dataPath)) {
                console.log('File missing:', test.file);
                continue;
            }

            let questions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            // Keep max 200 questions to avoid massive docs/errors
            if (questions.length > 200) questions = questions.slice(0, 200);
            
            questions = cleanQuestions(questions);

            await PracticeTest.create({
                examPattern: pattern._id,
                title: test.title,
                slug: test.slug,
                totalMarks: questions.length, // assuming 1 mark each
                duration: questions.length, // 1 min per question roughly
                isPYQ: true,
                pyqYear: 2020,
                pyqShift: 'Shift-1',
                pyqExamName: 'CIL Management Trainee',
                questions: questions
            });
            console.log('Successfully seeded:', test.title);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}
run();
