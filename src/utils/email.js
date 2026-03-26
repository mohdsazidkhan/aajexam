const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_EMAIL_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendBrevoEmail = async ({ to, subject, html, sender }) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = sender || {
            name: process.env.BREVO_SENDER_NAME || 'SUBG QUIZ',
            email: process.env.BREVO_SENDER_EMAIL || 'no-reply@subgquiz.com'
        };
        sendSmtpEmail.to = [{ email: to }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Email sent successfully using Brevo:', data.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending email through Brevo:', error.response ? error.response.body : error.message);
        return false;
    }
};

module.exports = { sendBrevoEmail };
