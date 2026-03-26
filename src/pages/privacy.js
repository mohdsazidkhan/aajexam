import PrivacyPolicy from '../components/pages/PrivacyPolicy';
import Head from 'next/head';

const PrivacyPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - AajExam Platform</title>
        <meta name="description" content="Read AajExam's privacy policy to understand how we collect, use, and protect your personal information. Your privacy and data security are our top priorities." />
        <meta name="keywords" content="privacy policy, data protection, user privacy, data security, GDPR compliance" />
        <meta property="og:title" content="Privacy Policy - AajExam Platform" />
        <meta property="og:description" content="Understand how AajExam protects your personal information and data." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy - AajExam" />
        <meta name="twitter:description" content="Learn about AajExam's privacy policy and data protection practices." />
      </Head>
      <PrivacyPolicy />
    </>
  );
};

export default PrivacyPage;
