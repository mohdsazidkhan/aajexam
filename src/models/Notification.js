import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    type: {
      type: String,
      enum: ['question', 'quiz', 'withdraw', 'contact', 'bank', 'subscription', 'registration', 'quiz_attempt', 'exam_attempt', 'blog', 'referral_registration', 'competition_reset', 'streak', 'daily_challenge', 'exam_news', 'current_affairs', 'study_plan', 'mentor', 'revision_reminder', 'discussion_reply', 'discussion_upvote'],
      required: true,
      index: true
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true },
    meta: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
