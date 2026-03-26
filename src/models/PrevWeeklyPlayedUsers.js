import mongoose from 'mongoose';

const prevWeeklyPlayedUsersSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  userName: { type: String },
  weeklyProgress: {
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
  week: {
    type: String,
    required: true // YYYY-WW format
  },
  originalUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

prevWeeklyPlayedUsersSchema.index({ originalUserId: 1, week: 1 }, { unique: true });

export default mongoose.models.PrevWeeklyPlayedUsers || mongoose.model('PrevWeeklyPlayedUsers', prevWeeklyPlayedUsersSchema);
