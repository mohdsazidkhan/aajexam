import mongoose from 'mongoose';

// A resumable mass-email campaign. Because free email plans cap the number of
// emails per day, a campaign is sent in small batches across multiple days.
// Progress is tracked here so sending can pause/resume without re-sending or
// skipping anyone.
const EmailCampaignSchema = new mongoose.Schema(
  {
    // Template
    subject: { type: String, required: true },
    heading: { type: String, default: '' },
    content: { type: String, default: '' },
    rawHtml: { type: Boolean, default: false },
    ctaText: { type: String, default: '' },
    ctaUrl: { type: String, default: '' },

    // Lifecycle: draft -> published -> active -> (paused) -> completed
    // Admin flow: write draft -> send a test email -> publish -> send to all.
    //   draft      = being written/edited + test emails; nothing sent to users
    //   published  = locked in, ready to send to all
    //   active     = batches are being sent
    //   paused     = sending stopped, resumable
    //   completed  = every targeted user processed
    status: {
      type: String,
      enum: ['draft', 'published', 'active', 'paused', 'completed'],
      default: 'draft',
      index: true
    },
    // Set when a test email is sent, so the UI can show the test step as done.
    testSentAt: { type: Date, default: null },
    testSentTo: { type: String, default: '' },
    publishedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },

    // Throttling
    dailyLimit: { type: Number, default: 300 },
    sentToday: { type: Number, default: 0 },
    sentDate: { type: String, default: '' }, // YYYY-MM-DD of the last send

    // Progress
    totalTargeted: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    cursor: { type: mongoose.Schema.Types.ObjectId, default: null }, // last processed User _id
    failedSample: { type: [String], default: [] }, // a few failed recipient emails, for visibility

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.EmailCampaign || mongoose.model('EmailCampaign', EmailCampaignSchema);
