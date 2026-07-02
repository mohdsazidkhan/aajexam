import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendBrevoEmail } from '@/utils/email';

// GET - Send Inactivity Reminders (Triggered by Vercel Cron)
export async function GET(req) {
    try {
        // Vercel Cron Authentication
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await dbConnect();

        // Calculate 7 days ago
        const sevenDaysAgoStart = new Date();
        sevenDaysAgoStart.setDate(sevenDaysAgoStart.getDate() - 7);
        sevenDaysAgoStart.setHours(0, 0, 0, 0);

        const sevenDaysAgoEnd = new Date(sevenDaysAgoStart);
        sevenDaysAgoEnd.setHours(23, 59, 59, 999);

        // Find users whose lastLoginDate was EXACTLY 7 days ago
        // (This prevents sending them emails every single day after 7 days)
        const inactiveUsers = await User.find({
            lastLoginDate: {
                $gte: sevenDaysAgoStart,
                $lte: sevenDaysAgoEnd
            },
            email: { $exists: true, $ne: null }
        }).select('name email');

        let emailsSent = 0;

        for (const user of inactiveUsers) {
            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #4F46E5;">We miss you, ${user.name}! 📚</h2>
                <p>It's been a week since your last practice session on AajExam.</p>
                <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #FCA5A5;">
                    <h3 style="margin-top: 0; color: #DC2626;">⏳ Your exam date is coming closer!</h3>
                    <p style="margin-bottom: 0;">Don't let your streak break. Consistency is the key to cracking competitive exams. Your pending PYQs and mock tests are waiting for you.</p>
                </div>
                <a href="https://aajexam.com/dashboard" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Resume Practice Now</a>
                <p style="margin-top: 30px; font-size: 0.9em; color: #64748B;">Keep pushing,<br><strong>The AajExam Team</strong></p>
            </div>
            `;

            try {
                await sendBrevoEmail({
                    to: user.email,
                    subject: 'Your exam date is coming closer! Complete your pending PYQ today ⏰',
                    html: html
                });
                emailsSent++;
            } catch (err) {
                console.error(`Failed to send inactivity email to ${user.email}`, err);
            }
        }

        return NextResponse.json({ success: true, message: `Sent ${emailsSent} inactivity reminders.` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
