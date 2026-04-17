import dynamic from 'next/dynamic';
import Head from 'next/head';

const DashboardAnalytics = dynamic(() => import('../../../components/pages/admin/DashboardAnalytics'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AnalyticsDashboardPage() {
  return (
    <>
      <Head>
        <title>Admin Analytics - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <DashboardAnalytics />
    </>
  );
}
