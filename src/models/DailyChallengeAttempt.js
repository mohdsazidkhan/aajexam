import mongoose from 'mongoose';

const dailyChallengeAttemptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyChallenge', required: true },
    answers: [{
        questionIndex: { type: Number, required: true },
        selectedOptionIndex: { type: Number, default: -1 },
        isCorrect: { type: Boolean, default: false },
        timeTaken: { type: Number, default: 0 }
    }],
    score: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

dailyChallengeAttemptSchema.index({ user: 1, challenge: 1 }, { unique: true });
dailyChallengeAttemptSchema.index({ challenge: 1, score: -1 });

export default mongoose.models.DailyChallengeAttempt || mongoose.model('DailyChallengeAttempt', dailyChallengeAttemptSchema);
