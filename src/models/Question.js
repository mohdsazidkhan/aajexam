import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    questionText: { type: String, required: true, trim: true },
    options: [{
        text: { type: String, required: true, trim: true },
        isCorrect: { type: Boolean, default: false }
    }],
    explanation: { type: String, trim: true, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String, trim: true, lowercase: true }],
    language: { type: String, enum: ['hi', 'en'], default: 'hi' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

questionSchema.index({ exam: 1, subject: 1, topic: 1 });
questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ topic: 1, isActive: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdAt: -1 });

export default mongoose.models.Question || mongoose.model('Question', questionSchema);
