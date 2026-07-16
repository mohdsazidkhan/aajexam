import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailCampaign from '@/models/EmailCampaign';
import { protect, admin } from '@/middleware/auth';
import { sendBrevoEmail } from '@/utils/email';
import { buildEmailHtml, personalize, BRAND_NAME } from '@/utils/emailTemplate';

// POST { campaignId, testEmail }
// Sends the SAVED campaign's template to one address, so what you test is
// exactly what users will receive. Does not touch campaign progress.
export async function POST(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { campaignId, testEmail } = body;

    if (!campaignId) {
      return NextResponse.json({ message: 'campaignId is required.' }, { status: 400 });
    }
    if (!testEmail || !String(testEmail).includes('@')) {
      return NextResponse.json({ message: 'A valid test email address is required.' }, { status: 400 });
    }

    await dbConnect();

    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found.' }, { status: 404 });
    }

    const htmlContent = buildEmailHtml({
      heading: campaign.heading,
      body: campaign.content,
      rawHtml: campaign.rawHtml,
      ctaText: campaign.ctaText,
      ctaUrl: campaign.ctaUrl
    });

    // Fill {{name}}/{{email}} the same way a real send would, using the
    // admin's own details — so the test shows exactly what a user gets.
    const vars = { name: auth.user?.name, email: testEmail };

    const ok = await sendBrevoEmail({
      to: testEmail,
      subject: personalize(campaign.subject, vars, false),
      html: personalize(htmlContent, vars),
      sender: {
        name: process.env.BREVO_SENDER_NAME || BRAND_NAME,
        email: process.env.BREVO_SENDER_EMAIL || 'aajexam.com@gmail.com'
      }
    });

    if (!ok) {
      return NextResponse.json({ message: 'Failed to send the test email.' }, { status: 502 });
    }

    // Record the test so the flow can show this step as done.
    campaign.testSentAt = new Date();
    campaign.testSentTo = String(testEmail);
    await campaign.save();

    return NextResponse.json({ message: `Test email sent to ${testEmail}.`, campaign });
  } catch (error) {
    console.error('Error sending campaign test email:', error);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}
