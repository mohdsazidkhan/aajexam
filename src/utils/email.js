const sendBrevoEmail = async ({ to, subject, html, sender }) => {
    try {
        const apiKey = process.env.BREVO_EMAIL_API_KEY;
        if (!apiKey) {
            console.error('❌ Brevo API Key is missing in environment variables');
            return false;
        }

        const payload = {
            sender: sender || {
                name: process.env.BREVO_SENDER_NAME || 'AajExam',
                email: process.env.BREVO_SENDER_EMAIL || 'aajexam.com@gmail.com'
            },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Email sent successfully using Brevo:', data.messageId);
            return true;
        } else {
            console.error('❌ Brevo API error:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending email through Brevo:', error.message);
        return false;
    }
};

const sendNewRegistrationAlert = async ({ user, provider = 'email', referrerName = null }) => {
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@mohdsazidkhan.com';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
    const registeredAt = new Date().toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });

    const rows = [
        ['Name', user.name || '—'],
        ['Email', user.email || '—'],
        ['Phone', user.phone || '—'],
        ['Username', user.username ? `@${user.username}` : '—'],
        ['Signup Method', provider === 'google' ? 'Google' : 'Email & Password'],
        ['Referred By', referrerName || '—'],
        ['Registered At', registeredAt],
    ].map(([label, value]) => `
        <div style="padding:10px;border-bottom:1px solid #f1f5f9;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">${label}</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#131f24;word-break:break-word;">${value}</p>
        </div>
    `).join('');

    const html = `
    <div style="font-family:Arial, sans-serif;max-width:600px;margin:0 auto;background:#f7fff0;padding:24px;">
        <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(53,122,2,0.08);">
            <div style="background:linear-gradient(135deg,#58cc02,#357a02);padding:28px 24px;text-align:center;">
                <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:-0.02em;color:#ffffff;">AAJ<span style="color:#0F1720;">EXAM</span></p>
                <p style="margin:8px 0 0;font-size:16px;font-weight:800;color:#ffffff;">🎉 New User Registered</p>
            </div>
            <div style="padding:24px;">
                <p style="margin:0 0 16px;font-size:14px;color:#334155;">A new student just joined AajExam. Here are the details:</p>
                <div style="border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;">
                    ${rows}
                </div>
                <div style="text-align:center;margin-top:24px;">
                    <a href="${siteUrl}/admin/students" style="display:inline-block;background:#357a02;color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;padding:12px 28px;border-radius:999px;">View in Admin Panel</a>
                </div>
            </div>
        </div>
        <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">This is an automated notification from AajExam.</p>
    </div>
    `;

    return sendBrevoEmail({
        to: contactEmail,
        subject: `🎉 New Registration: ${user.name || user.email}`,
        html
    }).catch((err) => {
        console.error('Failed to send new-registration admin alert email:', err);
        return false;
    });
};

module.exports = { sendBrevoEmail, sendNewRegistrationAlert };
