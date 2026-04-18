import mongoose from 'mongoose';

const questionSnapshotSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswerIndex: { type: Number, required: true },
    explanation: { type: String, default: '' },
    subject: { type: String, default: '' },
    topic: { type: String, default: '' },
    difficulty: { type: String, default: 'medium' }
}, { _id: false });

const revisionQueueSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    source: { type: String, enum: ['quiz', 'practice_test', 'daily_challenge', 'reel'], required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sourceTitle: { type: String, default: '' },
    sourceQuestionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
    questionSnapshot: { type: questionSnapshotSchema, required: true },

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
revisionQueueSchema.index({ user: 1, source: 1, sourceQuestionId: 1 }, { unique: true });
revisionQueueSchema.index({ user: 1, status: 1 });

if (mongoose.models.RevisionQueue) delete mongoose.models.RevisionQueue;
if (mongoose.connection?.models?.RevisionQueue) delete mongoose.connection.models.RevisionQueue;
if (mongoose.modelSchemas?.RevisionQueue) delete mongoose.modelSchemas.RevisionQueue;
const RevisionQueue = mongoose.model('RevisionQueue', revisionQueueSchema);
export default RevisionQueue;
