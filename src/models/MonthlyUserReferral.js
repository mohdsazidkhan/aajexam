import mongoose from 'mongoose';

const monthlyUserReferralSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    monthYear: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    referralCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

monthlyUserReferralSchema.index({ userId: 1, monthYear: 1 }, { unique: true });

monthlyUserReferralSchema.statics.incrementReferralCount = async function (userId, monthYear) {
    return this.findOneAndUpdate(
        { userId, monthYear },
        { $inc: { referralCount: 1 } },
        { upsert: true, new: true }
    );
};

export default mongoose.models.MonthlyUserReferral || mongoose.model('MonthlyUserReferral', monthlyUserReferralSchema);
