import PrivacyPolicy from '../components/pages/PrivacyPolicy';
import Head from 'next/head';

const PrivacyPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - SUBG QUIZ Platform</title>
        <meta name="description" content="Read SUBG QUIZ's privacy policy to understand how we collect, use, and protect your personal information. Your privacy and data security are our top priorities." />
        <meta name="keywords" content="privacy policy, data protection, user privacy, data security, GDPR compliance" />
        <meta property="og:title" content="Privacy Policy - SUBG QUIZ Platform" />
        <meta property="og:description" content="Understand how SUBG QUIZ protects your personal information and data." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy - SUBG QUIZ" />
        <meta name="twitter:description" content="Learn about SUBG QUIZ's privacy policy and data protection practices." />
      </Head>
      <PrivacyPolicy />
    </>
  );
};

export default PrivacyPage;