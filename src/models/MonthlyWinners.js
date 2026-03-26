import mongoose from 'mongoose';

const monthlyWinnersSchema = new mongoose.Schema({
  competitionType: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'monthly', required: true },
  month: { type: String },
  year: { type: Number },
  monthYear: { type: String, required: true }, // For monthly, this is YYYY-MM. For daily/weekly, it will be prefixed.
  winners: [{
    rank: { type: Number, required: true, enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    highScoreWins: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    totalQuizAttempts: { type: Number, required: true },
    totalCorrectAnswers: { type: Number, required: true },
    rewardAmount: { type: Number, required: true },
    claimableRewards: { type: Number, required: true },
    monthlyReferralCount: { type: Number, default: 0 },
    referralEligible: { type: Boolean, default: false }
  }],
  totalPrizePool: { type: Number, default: 0 },
  totalWinners: { type: Number, default: 0 },
  resetDate: { type: Date, default: Date.now },
  processedBy: { type: String, default: 'monthly_reset_cron' },
  metadata: { totalEligibleUsers: Number, resetTimestamp: Date, cronJobId: String }
}, { timestamps: true });

monthlyWinnersSchema.index({ competitionType: 1, year: 1, month: 1 });
monthlyWinnersSchema.index({ competitionType: 1, monthYear: 1 }, { unique: true });
monthlyWinnersSchema.index({ 'winners.userId': 1 });

monthlyWinnersSchema.statics.getUserWinningHistory = async function (userId) {
  const docs = await this.find({ 'winners.userId': userId }).sort({ year: -1, month: -1 }).lean();
  return docs.map(doc => {
    const winner = doc.winners.find(w => String(w.userId) === String(userId));
    return {
      monthYear: doc.monthYear,
      month: doc.month,
      year: doc.year,
      rank: winner ? winner.rank : null,
      rewardAmount: winner ? winner.rewardAmount : 0,
      highScoreWins: winner ? winner.highScoreWins : 0,
      accuracy: winner ? winner.accuracy : 0,
    };
  });
};

export default mongoose.models.MonthlyWinners || mongoose.model('MonthlyWinners', monthlyWinnersSchema);
