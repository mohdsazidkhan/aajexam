import RefundPolicy from '../components/pages/RefundPolicy';
import Head from 'next/head';

const RefundPage = () => {
  return (
    <>
      <Head>
        <title>Refund Policy - AajExam Platform</title>
        <meta name="description" content="Learn about AajExam's refund policy for subscriptions and payments. Understand the refund process, eligibility, and terms for requesting refunds." />
        <meta name="keywords" content="refund policy, money back, subscription refund, payment refund, cancellation policy" />
        <meta property="og:title" content="Refund Policy - AajExam Platform" />
        <meta property="og:description" content="Learn about AajExam's refund policy for subscriptions and payments." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Refund Policy - AajExam" />
        <meta name="twitter:description" content="Understand AajExam's refund process and eligibility." />
      </Head>
      <RefundPolicy />
    </>
  );
};

export default RefundPage;
