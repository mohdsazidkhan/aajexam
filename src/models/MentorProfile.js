import mongoose from 'mongoose';

const mentorProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    examsCleared: [{
        examName: { type: String, required: true },
        year: { type: Number, required: true },
        rank: { type: Number },
        score: { type: Number },
        attempt: { type: Number, default: 1 }
    }],
    strategy: { type: String, required: true, maxlength: 5000 },
    tips: [{ type: String, trim: true }],
    dailyRoutine: { type: String, default: '', maxlength: 3000 },
    booksRecommended: [{ type: String, trim: true }],
    preparationMonths: { type: Number, default: 0 },
    specialization: [{ type: String, trim: true }],
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    helpedStudents: { type: Number, default: 0 },
    amaThreads: [{
        question: { type: String, required: true, maxlength: 1000 },
        answer: { type: String, default: '', maxlength: 3000 },
        askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        askedAt: { type: Date, default: Date.now },
        answeredAt: { type: Date },
        upvotes: { type: Number, default: 0 },
        upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    status: { type: String, enum: ['pending', 'active', 'suspended', 'rejected'], default: 'pending' }
}, { timestamps: true });

mentorProfileSchema.index({ status: 1, rating: -1 });
mentorProfileSchema.index({ isVerified: 1, status: 1 });
mentorProfileSchema.index({ 'examsCleared.examName': 1 });

export default mongoose.models.MentorProfile || mongoose.model('MentorProfile', mentorProfileSchema);
