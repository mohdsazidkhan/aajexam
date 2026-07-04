import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

const mockQuestions = [
    {
        questionText: 'What is the headquarters of Coal India Limited?',
        options: ['New Delhi', 'Kolkata', 'Mumbai', 'Dhanbad'],
        correctAnswerIndex: 1,
        explanation: 'Coal India Limited (CIL) is an Indian state-owned coal mining and refinery company headquartered in Kolkata, West Bengal.',
        section: 'Paper I (General Knowledge/Awareness, Reasoning, Numerical Ability & English)',
        difficulty: 'easy',
        tags: ['General Knowledge', 'CIL']
    },
    {
        questionText: 'Which algorithm is used to find the shortest path in a graph with non-negative edge weights?',
        options: ['Kruskal\'s Algorithm', 'Prim\'s Algorithm', 'Dijkstra\'s Algorithm', 'Bellman-Ford Algorithm'],
        correctAnswerIndex: 2,
        explanation: 'Dijkstra\'s algorithm is used to find the shortest path from a source vertex to all other vertices in a graph with non-negative edge weights.',
        section: 'Paper II (Professional Knowledge)',
        difficulty: 'medium',
        tags: ['Computer Science', 'Algorithms']
    }
];

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const pattern = await ExamPattern.findOne({ title: /CIL Management Trainee/i });
        if (!pattern) {
            console.log('Error: CIL Exam Pattern not found. Run setup-pattern-cil.js first.');
            process.exit(1);
        }

        const testTitle = 'CIL Management Trainee (MT) - 2024 (Mock/Template)';
        const existingTest = await PracticeTest.findOne({ title: testTitle });

        if (existingTest) {
            console.log('Test already seeded:', existingTest.title);
        } else {
            console.log('Seeding CIL PYQ Mock...');
            const newTest = await PracticeTest.create({
                examPattern: pattern._id,
                title: testTitle,
                slug: 'cil-mt-2024-mock',
                totalMarks: 200,
                duration: 180,
                isPYQ: true,
                pyqYear: 2024,
                pyqShift: 'Shift-1',
                pyqExamName: 'CIL Management Trainee',
                questions: mockQuestions
            });
            console.log('Successfully seeded CIL MT Mock Test:', newTest._id);
        }
    } catch (error) {
        console.error('Failed to seed CIL Test:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
