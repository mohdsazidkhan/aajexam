import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const SubscriptionPage = dynamic(() => import('../components/pages/SubscriptionPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Subscription() {
  return (
    <>
      <Head>
        <title>Subscription Plans - SUBG QUIZ Reward Platform</title>
        <meta name="description" content="Explore SUBG QUIZ subscription plans. Get Pro access to earn Daily, Weekly, and Monthly rewards. Choose the plan that's right for you." />
        <meta name="keywords" content="subscription, pro plan, premium features, subscription plans, pro membership, upgrade account, daily rewards, weekly rewards, monthly rewards" />
        <meta property="og:title" content="Subscription Plans - SUBG QUIZ Platform" />
        <meta property="og:description" content="Explore SUBG QUIZ subscription plans and unlock PRO features." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Subscription Plans - SUBG QUIZ" />
        <meta name="twitter:description" content="Get Pro access and unlock PRO features on SUBG QUIZ." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <SubscriptionPage />
      </Suspense>
    </>
  );
}
