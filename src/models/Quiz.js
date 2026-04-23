import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    applicableExams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true }],
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    duration: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, default: 1, min: 0 },
    negativeMarking: { type: Number, default: 0, min: 0 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
    type: { type: String, enum: ['topic_practice', 'subject_test', 'full_mock'], default: 'topic_practice' },
    tags: [{ type: String, trim: true, lowercase: true }],
    accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
    totalAttempts: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

quizSchema.index({ applicableExams: 1, subject: 1, status: 1 });
quizSchema.index({ applicableExams: 1, subject: 1, topic: 1, status: 1 });
quizSchema.index({ status: 1, publishedAt: -1 });
quizSchema.index({ type: 1, status: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ accessLevel: 1, status: 1 });

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
