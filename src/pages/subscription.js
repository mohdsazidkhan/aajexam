import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getCanonicalUrl } from '../utils/seo';

const SubscriptionPage = dynamic(() => import('../components/pages/SubscriptionPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Subscription() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Subscription Plans - AajExam Reward Platform</title>
        <meta name="description" content="Explore AajExam subscription plans. Get Pro access to earn Daily, Weekly, and Monthly rewards. Choose the plan that's right for you." />
        <link rel="canonical" href={getCanonicalUrl(router.asPath)} />
        <meta property="og:title" content="Subscription Plans - AajExam Platform" />
        <meta property="og:description" content="Explore AajExam subscription plans and unlock PRO features." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Subscription Plans - AajExam" />
        <meta name="twitter:description" content="Get Pro access and unlock PRO features on AajExam." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <SubscriptionPage />
      </Suspense>
    </>
  );
}
