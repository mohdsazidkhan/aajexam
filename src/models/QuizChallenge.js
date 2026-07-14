import mongoose from 'mongoose';

const quizChallengeSchema = new mongoose.Schema({
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    hostAttempt: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true },
    code: { type: String, unique: true, required: true },
    challengers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true },
        joinedAt: { type: Date, default: Date.now }
    }],
    status: { type: String, enum: ['active', 'expired'], default: 'active' }
}, { timestamps: true });

quizChallengeSchema.index({ host: 1 });
quizChallengeSchema.index({ quiz: 1 });

export default mongoose.models.QuizChallenge || mongoose.model('QuizChallenge', quizChallengeSchema);
