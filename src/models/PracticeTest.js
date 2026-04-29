import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const practiceTestSchema = new mongoose.Schema({
    examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true, index: true },
    totalMarks: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
    isPYQ: { type: Boolean, default: false },
    pyqYear: { type: Number, default: null },
    pyqShift: { type: String, default: null, trim: true },
    pyqExamName: { type: String, default: null, trim: true },
    publishedAt: { type: Date, default: Date.now },
    questions: [{
        questionText: { type: String, required: true },
        questionImage: { type: String, default: '' },
        options: [{ type: String, required: true }],
        optionImages: [{ type: String, default: '' }],
        correctAnswerIndex: { type: Number, required: true, min: 0 },
        explanation: { type: String, trim: true },
        section: { type: String, required: true, trim: true },
        tags: [{ type: String, trim: true }],
        difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' }
    }]
}, { timestamps: true });

practiceTestSchema.index({ examPattern: 1 });
practiceTestSchema.index({ accessLevel: 1 });
practiceTestSchema.index({ publishedAt: -1 });
practiceTestSchema.index({ isPYQ: 1, pyqYear: -1 });
practiceTestSchema.index({ isPYQ: 1, examPattern: 1, pyqYear: -1 });
practiceTestSchema.index({ slug: 1 }, { unique: true, sparse: true });

attachSlugHook(practiceTestSchema, { sourceField: 'title' });

export default mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);
