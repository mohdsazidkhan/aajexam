import mongoose from 'mongoose';

const revisionQueueSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    source: { type: String, enum: ['quiz', 'daily_challenge', 'pyq', 'practice_test'], default: 'quiz' },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
    nextReviewDate: { type: Date, required: true },
    interval: { type: Number, default: 1 },
    easeFactor: { type: Number, default: 2.5 },
    repetitions: { type: Number, default: 0 },
    lastReviewedAt: { type: Date, default: null },
    lastAnswer: { type: String, enum: ['correct', 'wrong', 'skipped'], default: 'wrong' },
    totalReviews: { type: Number, default: 0 },
    correctReviews: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'mastered', 'suspended'], default: 'active' }
}, { timestamps: true });

revisionQueueSchema.index({ user: 1, nextReviewDate: 1, status: 1 });
revisionQueueSchema.index({ user: 1, question: 1 }, { unique: true });
revisionQueueSchema.index({ user: 1, status: 1 });

export default mongoose.models.RevisionQueue || mongoose.model('RevisionQueue', revisionQueueSchema);
