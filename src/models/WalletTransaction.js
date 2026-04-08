import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'question_reward', 'blog_reward',
      'subscription_payment', 'refund', 'bonus',
      'withdrawal', 'admin_subscription_adjustment', 'other'
    ],
    default: 'other'
  },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'completed' },
  reference: { type: String },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserQuestions' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  processedAt: { type: Date, default: Date.now },

  // ─── Idempotency key: prevents double-crediting on cron re-runs ───────────
  // Format: "competition-{type}-{period}-rank-{n}-user-{userId}"
  // or:     "referral-{referralCode}-{eventType}"
  idempotencyKey: { type: String, default: null }
}, { timestamps: true });

// Unique sparse index so null values don't conflict but set keys are enforced
walletTransactionSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ user: 1, category: 1, status: 1 });

export default mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
