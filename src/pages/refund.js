import RefundPolicy from '../components/pages/RefundPolicy';
import Head from 'next/head';
import { generateBreadcrumbSchema, renderSchema } from '../utils/schema';

const RefundPage = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Refund Policy' }
  ]);

  return (
    <>
      <Head>
        <title>Refund Policy - AajExam Platform</title>
        <meta name="description" content="Learn about AajExam's refund policy for subscriptions and payments. Understand the refund process, eligibility, and terms for requesting refunds." />
        <meta name="keywords" content="refund policy, money back, subscription refund, payment refund, cancellation policy" />
        <link rel="canonical" href={`${siteUrl}/refund`} />
        <meta property="og:title" content="Refund Policy - AajExam Platform" />
        <meta property="og:description" content="Learn about AajExam's refund policy for subscriptions and payments." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AajExam" />
        <meta property="og:url" content={`${siteUrl}/refund`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@AajExam" />
        <meta name="twitter:title" content="Refund Policy - AajExam" />
        <meta name="twitter:description" content="Understand AajExam's refund process and eligibility." />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />
        <meta name="robots" content="index, follow" />
        {renderSchema(breadcrumbSchema)}
      </Head>
      <RefundPolicy />
    </>
  );
};

export default RefundPage;
