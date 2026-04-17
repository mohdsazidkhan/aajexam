import dynamic from 'next/dynamic';
import Head from 'next/head';

const UserAnalytics = dynamic(() => import('../../../components/pages/admin/UserAnalytics'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function UsersAnalyticsPage() {
  return (
    <>
      <Head>
        <title>Admin Users Analytics - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <UserAnalytics />
    </>
  );
}


