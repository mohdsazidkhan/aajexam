import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import EmailCampaign from '@/models/EmailCampaign';
import EmailCampaignRecipient from '@/models/EmailCampaignRecipient';
import { protect, admin } from '@/middleware/auth';
import { sendBrevoEmail } from '@/utils/email';
import { buildEmailHtml, personalize, BRAND_NAME } from '@/utils/emailTemplate';

// How many emails to send per HTTP call. Kept small so each request finishes
// well within serverless time limits; the client calls this repeatedly.
// Tune via EMAIL_BATCH_SIZE in .env.
const PER_CALL = Math.max(1, parseInt(process.env.EMAIL_BATCH_SIZE, 10) || 25);

// Date string (YYYY-MM-DD) in IST, so the daily quota resets on India time.
function istDateStr() {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.toISOString().slice(0, 10);
}

function progressOf(campaign, extra = {}) {
  const processed = campaign.sentCount + campaign.failedCount;
  return {
    campaignId: String(campaign._id),
    status: campaign.status,
    totalTargeted: campaign.totalTargeted,
    sentCount: campaign.sentCount,
    failedCount: campaign.failedCount,
    processed,
    dailyLimit: campaign.dailyLimit,
    sentToday: campaign.sentToday,
    remainingToday: Math.max(0, campaign.dailyLimit - campaign.sentToday),
    ...extra
  };
}

export async function POST(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { campaignId } = body;
    if (!campaignId) {
      return NextResponse.json({ message: 'campaignId is required.' }, { status: 400 });
    }

    await dbConnect();
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found.' }, { status: 404 });
    }

    if (campaign.status === 'completed') {
      return NextResponse.json(progressOf(campaign, { done: true }));
    }
    if (campaign.status === 'paused') {
      return NextResponse.json(progressOf(campaign, { paused: true }));
    }
    // Nothing is ever sent until the campaign has been published AND started.
    if (campaign.status === 'draft' || campaign.status === 'published') {
      return NextResponse.json(progressOf(campaign, { notStarted: true }));
    }

    // Reset the daily counter when the date rolls over.
    const today = istDateStr();
    if (campaign.sentDate !== today) {
      campaign.sentToday = 0;
      campaign.sentDate = today;
    }

    const remainingToday = campaign.dailyLimit - campaign.sentToday;
    if (remainingToday <= 0) {
      await campaign.save();
      return NextResponse.json(progressOf(campaign, { quotaReached: true }));
    }

    const batchSize = Math.min(remainingToday, PER_CALL);

    // Fetch the next slice of users (ordered by _id) after the cursor.
    const query = { email: { $exists: true, $ne: null } };
    if (campaign.cursor) query._id = { $gt: campaign.cursor };
    const candidates = await User.find(query)
      .sort({ _id: 1 })
      .limit(batchSize)
      .select('email name')
      .lean();

    if (candidates.length === 0) {
      campaign.status = 'completed';
      await campaign.save();
      return NextResponse.json(progressOf(campaign, { done: true }));
    }

    // Safety net: never email anyone already recorded for this campaign
    // (protects against a retried batch double-sending).
    const already = await EmailCampaignRecipient
      .find({ campaignId: campaign._id, userId: { $in: candidates.map(u => u._id) } })
      .select('userId')
      .lean();
    const alreadySet = new Set(already.map(r => String(r.userId)));
    const users = candidates.filter(u => !alreadySet.has(String(u._id)));

    // Everyone in this slice was already handled — just advance past them.
    if (users.length === 0) {
      campaign.cursor = candidates[candidates.length - 1]._id;
      if (candidates.length < batchSize) campaign.status = 'completed';
      await campaign.save();
      return NextResponse.json(progressOf(campaign, {
        sent: 0,
        failed: 0,
        skipped: candidates.length,
        done: campaign.status === 'completed'
      }));
    }

    const htmlContent = buildEmailHtml({
      heading: campaign.heading,
      body: campaign.content,
      rawHtml: campaign.rawHtml,
      ctaText: campaign.ctaText,
      ctaUrl: campaign.ctaUrl
    });

    const sender = {
      name: process.env.BREVO_SENDER_NAME || BRAND_NAME,
      email: process.env.BREVO_SENDER_EMAIL || 'aajexam.com@gmail.com'
    };

    // Each recipient gets their own copy with {{name}}/{{email}} filled in
    // from the DB. Values are escaped inside personalize().
    const results = await Promise.allSettled(
      users.map(u => sendBrevoEmail({
        to: u.email,
        subject: personalize(campaign.subject, { name: u.name, email: u.email }, false),
        html: personalize(htmlContent, { name: u.name, email: u.email }),
        sender
      }))
    );

    let succeeded = 0;
    const failedEmails = [];
    const recipientRows = [];
    results.forEach((r, i) => {
      const ok = r.status === 'fulfilled' && r.value === true;
      if (ok) {
        succeeded++;
      } else {
        failedEmails.push(users[i].email);
      }
      recipientRows.push({
        campaignId: campaign._id,
        userId: users[i]._id,
        email: users[i].email,
        status: ok ? 'sent' : 'failed',
        error: ok ? '' : (r.reason?.message || 'Send failed'),
        sentAt: new Date()
      });
    });

    // If the whole batch failed, treat it as a rate-limit / outage: do NOT
    // advance the cursor or record recipients (so nobody is skipped or wrongly
    // marked) and stop the driver.
    if (succeeded === 0) {
      await campaign.save(); // persist the date reset only
      return NextResponse.json(progressOf(campaign, { batchFailed: true }));
    }

    // Link each user to this campaign. ordered:false + the unique
    // (campaignId, userId) index means a duplicate is ignored, not fatal.
    try {
      await EmailCampaignRecipient.insertMany(recipientRows, { ordered: false });
    } catch (e) {
      if (e?.code !== 11000 && !e?.writeErrors) throw e; // ignore duplicate-key only
    }

    // Commit progress. The cursor moves past every user we examined.
    campaign.cursor = candidates[candidates.length - 1]._id;
    campaign.sentCount += succeeded;
    campaign.failedCount += failedEmails.length;
    campaign.sentToday += users.length;
    if (failedEmails.length) {
      campaign.failedSample = [...campaign.failedSample, ...failedEmails].slice(-20);
    }

    // Fewer users returned than requested => this was the last batch.
    let done = false;
    if (candidates.length < batchSize) {
      campaign.status = 'completed';
      done = true;
    }

    await campaign.save();

    return NextResponse.json(progressOf(campaign, {
      sent: succeeded,
      failed: failedEmails.length,
      done,
      quotaReached: (campaign.dailyLimit - campaign.sentToday) <= 0 && !done
    }));
  } catch (error) {
    console.error('Error processing email campaign batch:', error);
    return NextResponse.json({ error: 'Failed to process batch' }, { status: 500 });
  }
}
