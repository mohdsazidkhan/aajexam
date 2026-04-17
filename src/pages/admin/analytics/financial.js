import dynamic from 'next/dynamic';
import Head from 'next/head';

const FinancialAnalytics = dynamic(() => import('../../../components/pages/admin/FinancialAnalytics'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function FinancialAnalyticsPage() {
  return (
    <>
      <Head>
        <title>Admin Financial Analytics - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <FinancialAnalytics />
    </>
  );
}
