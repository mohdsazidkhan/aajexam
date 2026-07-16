import mongoose from 'mongoose';

// One row per (campaign, user) pair: the audit trail of exactly who a campaign
// was sent to. Answers "campaign #X has already gone to these users".
// The unique (campaignId, userId) index also makes sending idempotent — the
// same user can never be recorded twice for the same campaign.
const EmailCampaignRecipientSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailCampaign', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Snapshot of the address actually used (the user may change it later).
    email: { type: String, required: true },

    status: { type: String, enum: ['sent', 'failed'], required: true, index: true },
    error: { type: String, default: '' },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A user is recorded at most once per campaign.
EmailCampaignRecipientSchema.index({ campaignId: 1, userId: 1 }, { unique: true });
// Fast "list recipients of campaign X, newest first / filtered by status".
EmailCampaignRecipientSchema.index({ campaignId: 1, status: 1, sentAt: -1 });

export default mongoose.models.EmailCampaignRecipient
  || mongoose.model('EmailCampaignRecipient', EmailCampaignRecipientSchema);
