import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailCampaign from '@/models/EmailCampaign';
import EmailCampaignRecipient from '@/models/EmailCampaignRecipient';
import { protect, admin } from '@/middleware/auth';

// Allowed status transitions for the draft -> published -> active flow.
//   publish   : draft     -> published   (locks it in, test emails allowed)
//   unpublish : published -> draft       (back to editing)
//   start     : published -> active      ("Send to all" — begins real sending)
//   pause     : active    -> paused
//   resume    : paused    -> active
const TRANSITIONS = {
  publish: { from: ['draft'], to: 'published' },
  unpublish: { from: ['published'], to: 'draft' },
  start: { from: ['published'], to: 'active' },
  pause: { from: ['active'], to: 'paused' },
  resume: { from: ['paused'], to: 'active' }
};

// POST { campaignId, action: 'publish'|'unpublish'|'start'|'pause'|'resume'|'delete' }
export async function POST(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { campaignId, action } = body;
    if (!campaignId || !action) {
      return NextResponse.json({ message: 'campaignId and action are required.' }, { status: 400 });
    }

    await dbConnect();

    if (action === 'delete') {
      // Drop the recipient audit rows too, otherwise they linger forever
      // pointing at a campaign that no longer exists.
      await Promise.all([
        EmailCampaign.deleteOne({ _id: campaignId }),
        EmailCampaignRecipient.deleteMany({ campaignId })
      ]);
      return NextResponse.json({ message: 'Campaign deleted.' });
    }

    const rule = TRANSITIONS[action];
    if (!rule) {
      return NextResponse.json({ message: 'Invalid action.' }, { status: 400 });
    }

    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found.' }, { status: 404 });
    }
    if (!rule.from.includes(campaign.status)) {
      return NextResponse.json({
        message: `Cannot ${action} a campaign that is "${campaign.status}".`
      }, { status: 400 });
    }

    // The daily send quota belongs to the whole email account, so only one
    // campaign may be mid-send at a time — otherwise each would track its own
    // counter and together they'd blow past the limit.
    if (action === 'start' || action === 'resume') {
      const other = await EmailCampaign.findOne({
        _id: { $ne: campaign._id },
        status: { $in: ['active', 'paused'] }
      }).select('subject').lean();
      if (other) {
        return NextResponse.json({
          message: `Another campaign ("${other.subject}") is still sending. Finish or delete it first.`
        }, { status: 409 });
      }
    }

    campaign.status = rule.to;
    if (action === 'publish') campaign.publishedAt = new Date();
    if (action === 'start' && !campaign.startedAt) campaign.startedAt = new Date();

    await campaign.save();

    const messages = {
      publish: 'Campaign published — you can now send a test email.',
      unpublish: 'Campaign moved back to draft.',
      start: 'Sending started.',
      pause: 'Campaign paused.',
      resume: 'Campaign resumed.'
    };

    return NextResponse.json({
      message: messages[action],
      status: campaign.status,
      campaign
    });
  } catch (error) {
    console.error('Error controlling email campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}
