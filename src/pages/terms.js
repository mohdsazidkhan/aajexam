import TermsAndConditions from '../components/pages/TermsAndConditions';
import Head from 'next/head';
import { generateBreadcrumbSchema, renderSchema } from '../utils/schema';

const TermsPage = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
  return (
    <>
      <Head>
        <title>Terms and Conditions - AajExam Platform</title>
        <meta name="description" content="Read AajExam's terms and conditions. Understand the rules, guidelines, and user agreements for using our quiz platform and services." />
        <meta name="keywords" content="terms and conditions, user agreement, terms of service, AajExam terms" />
        <link rel="canonical" href={`${siteUrl}/terms`} />
        <meta property="og:title" content="Terms and Conditions - AajExam Platform" />
        <meta property="og:description" content="Read AajExam's terms and conditions for using our platform." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AajExam" />
        <meta property="og:url" content={`${siteUrl}/terms`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@AajExam" />
        <meta name="twitter:title" content="Terms and Conditions - AajExam" />
        <meta name="twitter:description" content="Understand AajExam's terms of service and user agreements." />
        {renderSchema(generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Terms and Conditions' }
        ]))}
      </Head>
      <TermsAndConditions />
    </>
  );
};

export default TermsPage;
