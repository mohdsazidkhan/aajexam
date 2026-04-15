import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getCanonicalUrl } from '../utils/seo';
import { generateBreadcrumbSchema, renderSchema } from '../utils/schema';

const SubscriptionPage = dynamic(() => import('../components/pages/SubscriptionPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Subscription() {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

  return (
    <>
      <Head>
        <title>Subscription Plans - AajExam Reward Platform</title>
        <meta name="description" content="Explore AajExam subscription plans. Get Pro access to earn Daily, Weekly, and Monthly rewards. Choose the plan that's right for you." />
        <meta name="keywords" content="subscription plans, pro plan, premium features, AajExam pricing, government exam subscription" />
        <link rel="canonical" href={getCanonicalUrl(router.asPath)} />
        <meta property="og:title" content="Subscription Plans - AajExam Platform" />
        <meta property="og:description" content="Explore AajExam subscription plans and unlock PRO features." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AajExam" />
        <meta property="og:url" content={`${siteUrl}/subscription`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@AajExam" />
        <meta name="twitter:title" content="Subscription Plans - AajExam" />
        <meta name="twitter:description" content="Get Pro access and unlock PRO features on AajExam." />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />
        {renderSchema(generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Subscription Plans' }
        ]))}
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <SubscriptionPage />
      </Suspense>
    </>
  );
}
