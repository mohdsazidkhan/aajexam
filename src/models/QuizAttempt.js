import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    answers: [{
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedOptionIndex: { type: Number, default: -1 },
        isCorrect: { type: Boolean, default: false },
        timeTaken: { type: Number, default: 0 }
    }],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    rank: { type: Number },
    percentile: { type: Number },
    status: { type: String, enum: ['InProgress', 'Completed', 'Abandoned'], default: 'InProgress' }
}, { timestamps: true });

quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ quiz: 1, status: 1, score: -1 });
quizAttemptSchema.index({ user: 1, status: 1, createdAt: -1 });
quizAttemptSchema.index({ quiz: 1, status: 1, score: -1, totalTime: 1 });

export default mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);
