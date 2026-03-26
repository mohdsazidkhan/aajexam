import mongoose from 'mongoose';

const userTestAttemptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    practiceTest: { type: mongoose.Schema.Types.ObjectId, ref: 'PracticeTest', required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        selectedIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, default: false },
        timeTaken: { type: Number, default: 0 }
    }],
    score: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    rank: { type: Number },
    percentile: { type: Number },
    status: { type: String, enum: ['InProgress', 'Completed', 'Abandoned'], default: 'InProgress' }
}, { timestamps: true });

userTestAttemptSchema.index({ user: 1, practiceTest: 1 });
userTestAttemptSchema.index({ practiceTest: 1, score: -1 });
userTestAttemptSchema.index({ practiceTest: 1, status: 1 });
userTestAttemptSchema.index({ practiceTest: 1, status: 1, score: -1, totalTime: 1 });

export default mongoose.models.UserTestAttempt || mongoose.model('UserTestAttempt', userTestAttemptSchema);
