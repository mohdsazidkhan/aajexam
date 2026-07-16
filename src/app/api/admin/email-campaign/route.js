import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import EmailCampaign from '@/models/EmailCampaign';
import { protect, admin } from '@/middleware/auth';

// A campaign mid-send. Only one of these may exist at a time, because the daily
// send quota belongs to the whole email account — two campaigns sending at once
// would each track their own counter and blow past the limit.
const SENDING_STATUSES = ['active', 'paused'];

// GET ?id=<id>  -> that one campaign
// GET           -> paginated list of all campaigns (newest first) for the list page
export async function GET(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const campaign = await EmailCampaign.findById(id).lean();
      if (!campaign) {
        return NextResponse.json({ message: 'Campaign not found.' }, { status: 404 });
      }
      return NextResponse.json({ campaign });
    }

    const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit'), 10) || 20));
    const status = searchParams.get('status');

    const query = {};
    if (status && status !== 'all') query.status = status;

    const [campaigns, total, sending] = await Promise.all([
      EmailCampaign.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      EmailCampaign.countDocuments(query),
      // Tells the UI whether "Send to all" is available on any other campaign.
      EmailCampaign.findOne({ status: { $in: SENDING_STATUSES } }).select('_id subject').lean()
    ]);

    return NextResponse.json({
      campaigns,
      sendingCampaign: sending || null,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

// POST: save a new campaign as a DRAFT. Any number of drafts may exist; the
// one-at-a-time rule only applies to actually sending (see /control 'start').
export async function POST(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      subject,
      heading = '',
      content = '',
      rawHtml = false,
      ctaText = '',
      ctaUrl = '',
      dailyLimit = 300
    } = body;

    if (!subject || !String(subject).trim()) {
      return NextResponse.json({ message: 'Subject is required.' }, { status: 400 });
    }
    if (!content || !String(content).trim()) {
      return NextResponse.json({ message: 'Email content is required.' }, { status: 400 });
    }

    await dbConnect();

    const totalTargeted = await User.countDocuments({ email: { $exists: true, $ne: null } });
    if (totalTargeted === 0) {
      return NextResponse.json({ message: 'No users found with email addresses.' }, { status: 404 });
    }

    const limit = Math.max(1, parseInt(dailyLimit, 10) || 300);

    const campaign = await EmailCampaign.create({
      subject: String(subject),
      heading,
      content,
      rawHtml: !!rawHtml,
      ctaText,
      ctaUrl,
      status: 'draft',
      dailyLimit: limit,
      totalTargeted,
      sentCount: 0,
      failedCount: 0,
      sentToday: 0,
      sentDate: '',
      cursor: null,
      createdBy: auth.user?._id || auth.user?.id
    });

    return NextResponse.json({ message: 'Draft saved.', campaign }, { status: 201 });
  } catch (error) {
    console.error('Error creating email campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

// PUT: edit an existing campaign's template in place (same campaign, same _id,
// progress preserved). Only affects users who have NOT been emailed yet —
// anyone already sent received the previous content.
export async function PUT(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { campaignId, subject, heading, content, rawHtml, ctaText, ctaUrl, dailyLimit } = body;

    if (!campaignId) {
      return NextResponse.json({ message: 'campaignId is required.' }, { status: 400 });
    }
    if (!subject || !String(subject).trim()) {
      return NextResponse.json({ message: 'Subject is required.' }, { status: 400 });
    }
    if (!content || !String(content).trim()) {
      return NextResponse.json({ message: 'Email content is required.' }, { status: 400 });
    }

    await dbConnect();

    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found.' }, { status: 404 });
    }
    if (campaign.status === 'completed') {
      return NextResponse.json({
        message: 'This campaign is already completed and can no longer be edited.'
      }, { status: 400 });
    }
    if (campaign.status === 'active') {
      return NextResponse.json({
        message: 'Pause the campaign before editing it.'
      }, { status: 400 });
    }

    campaign.subject = String(subject);
    campaign.heading = heading || '';
    campaign.content = content;
    campaign.rawHtml = !!rawHtml;
    campaign.ctaText = ctaText || '';
    campaign.ctaUrl = ctaUrl || '';
    if (dailyLimit != null) {
      campaign.dailyLimit = Math.max(1, parseInt(dailyLimit, 10) || campaign.dailyLimit);
    }

    await campaign.save();

    return NextResponse.json({
      message: campaign.sentCount > 0
        ? `Campaign updated. The ${campaign.sentCount} user(s) already emailed received the old version; the rest will get this one.`
        : 'Campaign updated.',
      campaign
    });
  } catch (error) {
    console.error('Error updating email campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}
