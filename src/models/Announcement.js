import mongoose from 'mongoose';

// Log of admin broadcast sends (one row per "Announce" submission), separate
// from the per-recipient Notification documents it fans out to — lets the
// admin panel show "what did we announce and to whom" without having to
// group thousands of individual Notification rows back together.
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  target: { type: String, enum: ['all', 'pro', 'free', 'users'], required: true },
  recipientCount: { type: Number, default: 0 },
  // Only populated when target === 'users' (specific/selected user picks) — a
  // denormalized snapshot so the list stays accurate even if a user later
  // changes their name/email.
  recipients: [{
    _id: false,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String
  }],
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
