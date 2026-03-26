import RefundPolicy from '../components/pages/RefundPolicy';
import Head from 'next/head';

const RefundPage = () => {
  return (
    <>
      <Head>
        <title>Refund Policy - SUBG QUIZ Platform</title>
        <meta name="description" content="Learn about SUBG QUIZ's refund policy for subscriptions and payments. Understand the refund process, eligibility, and terms for requesting refunds." />
        <meta name="keywords" content="refund policy, money back, subscription refund, payment refund, cancellation policy" />
        <meta property="og:title" content="Refund Policy - SUBG QUIZ Platform" />
        <meta property="og:description" content="Learn about SUBG QUIZ's refund policy for subscriptions and payments." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Refund Policy - SUBG QUIZ" />
        <meta name="twitter:description" content="Understand SUBG QUIZ's refund process and eligibility." />
      </Head>
      <RefundPolicy />
    </>
  );
};

export default RefundPage;
