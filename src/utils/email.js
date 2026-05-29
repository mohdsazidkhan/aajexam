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

module.exports = { sendBrevoEmail };
