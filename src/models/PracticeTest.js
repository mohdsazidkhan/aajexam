import mongoose from 'mongoose';

const practiceTestSchema = new mongoose.Schema({
    examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
    title: { type: String, required: true, trim: true },
    totalMarks: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    isFree: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswerIndex: { type: Number, required: true, min: 0 },
        explanation: { type: String, trim: true },
        section: { type: String, required: true, trim: true },
        tags: [{ type: String, trim: true }],
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
    }]
}, { timestamps: true });

practiceTestSchema.index({ examPattern: 1 });
practiceTestSchema.index({ isFree: 1 });
practiceTestSchema.index({ publishedAt: -1 });

export default mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);
