import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: {
    type: String,
    enum: ['FREE', 'PRO'],
    default: 'FREE'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  duration: { type: String, default: '1 month' },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  autoRenew: { type: Boolean, default: false },
  paymentMethod: { type: String },
  amount: { type: Number },
  currency: { type: String, default: 'INR' },
  features: {
    unlimitedQuizzes: { type: Boolean, default: false },
    detailedAnalytics: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customCategories: { type: Boolean, default: false },
    advancedReports: { type: Boolean, default: false },
    exportData: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false }
  },
  metadata: { type: mongoose.Schema.Types.Mixed },
  cancelledAt: { type: Date },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
subscriptionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
