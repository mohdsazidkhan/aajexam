import mongoose from 'mongoose';

const userStreakSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    totalActiveDays: { type: Number, default: 0 },
    freezesAvailable: { type: Number, default: 0 },
    freezesUsed: { type: Number, default: 0 },
    lastFreezeDate: { type: Date, default: null },
    streakHistory: [{
        date: { type: Date, required: true },
        challengeCompleted: { type: Boolean, default: false },
        questionsAttempted: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        frozeStreak: { type: Boolean, default: false }
    }]
}, { timestamps: true });

userStreakSchema.index({ currentStreak: -1 });
userStreakSchema.index({ longestStreak: -1 });

export default mongoose.models.UserStreak || mongoose.model('UserStreak', userStreakSchema);
