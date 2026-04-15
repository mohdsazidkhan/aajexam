import PrivacyPolicy from '../components/pages/PrivacyPolicy';
import Head from 'next/head';
import { generateBreadcrumbSchema, renderSchema } from '../utils/schema';

const PrivacyPage = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
  return (
    <>
      <Head>
        <title>Privacy Policy - AajExam Platform</title>
        <meta name="description" content="Read AajExam's privacy policy to understand how we collect, use, and protect your personal information. Your privacy and data security are our top priorities." />
        <meta name="keywords" content="privacy policy, data protection, user privacy, data security, AajExam privacy" />
        <link rel="canonical" href={`${siteUrl}/privacy`} />
        <meta property="og:title" content="Privacy Policy - AajExam Platform" />
        <meta property="og:description" content="Understand how AajExam protects your personal information and data." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AajExam" />
        <meta property="og:url" content={`${siteUrl}/privacy`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@AajExam" />
        <meta name="twitter:title" content="Privacy Policy - AajExam" />
        <meta name="twitter:description" content="Learn about AajExam's privacy policy and data protection practices." />
        {renderSchema(generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy' }
        ]))}
      </Head>
      <PrivacyPolicy />
    </>
  );
};

export default PrivacyPage;
