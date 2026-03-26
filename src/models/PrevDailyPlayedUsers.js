import mongoose from 'mongoose';

const prevDailyPlayedUsersSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  userName: { type: String },
  dailyProgress: {
    type: Object,
    default: {}
  },
  quizBestScores: {
    type: Array,
    default: []
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  date: {
    type: String,
    required: true // YYYY-MM-DD format
  },
  originalUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

prevDailyPlayedUsersSchema.index({ originalUserId: 1, date: 1 }, { unique: true });

export default mongoose.models.PrevDailyPlayedUsers || mongoose.model('PrevDailyPlayedUsers', prevDailyPlayedUsersSchema);
