import mongoose from 'mongoose';

const prevMonthPlayedUsersSchema = new mongoose.Schema({

  name: { type: String },
  email: { type: String },
  phone: { type: String },
  userName: { type: String },
  level: {
    type: Object,
    default: {}
  },
  quizBestScores: {
    type: Array,
    default: []
  },
  claimableRewards: {
    type: Number,
    default: 0
  },
  monthlyProgress: {
    type: Object,
    default: {}
  },
  subscriptionStatus: {
    type: String,
    default: ''
  },
  currentSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  // Additional fields to track when data was saved
  savedAt: {
    type: Date,
    default: Date.now
  },
  monthYear: {
    type: String,
    required: true // YYYY-MM format
  },
  originalUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.models.PrevMonthPlayedUsers || mongoose.model('PrevMonthPlayedUsers', prevMonthPlayedUsersSchema);
