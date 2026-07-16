import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailCampaignRecipient from '@/models/EmailCampaignRecipient';
import { protect, admin } from '@/middleware/auth';

// GET /api/admin/email-campaign/recipients?campaignId=...&page=1&limit=50&status=sent|failed
// Lists exactly which users a campaign has been sent to.
export async function GET(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    if (!campaignId) {
      return NextResponse.json({ message: 'campaignId is required.' }, { status: 400 });
    }

    const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit'), 10) || 50));
    const status = searchParams.get('status');

    await dbConnect();

    const query = { campaignId };
    if (status === 'sent' || status === 'failed') query.status = status;

    const [recipients, total, sentTotal, failedTotal] = await Promise.all([
      EmailCampaignRecipient.find(query)
        .sort({ sentAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name username email')
        .lean(),
      EmailCampaignRecipient.countDocuments(query),
      EmailCampaignRecipient.countDocuments({ campaignId, status: 'sent' }),
      EmailCampaignRecipient.countDocuments({ campaignId, status: 'failed' })
    ]);

    return NextResponse.json({
      recipients: recipients.map(r => ({
        _id: r._id,
        email: r.email,
        status: r.status,
        error: r.error,
        sentAt: r.sentAt,
        user: r.userId ? { _id: r.userId._id, name: r.userId.name, username: r.userId.username } : null
      })),
      counts: { sent: sentTotal, failed: failedTotal, total: sentTotal + failedTotal },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error listing campaign recipients:', error);
    return NextResponse.json({ error: 'Failed to list recipients' }, { status: 500 });
  }
}
