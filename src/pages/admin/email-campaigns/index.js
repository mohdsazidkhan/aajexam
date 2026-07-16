import dynamic from 'next/dynamic';
import Head from 'next/head';

const EmailCampaignsListPage = dynamic(() => import('../../../components/pages/admin/EmailCampaignsListPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function EmailCampaigns() {
  return (
    <>
      <Head>
        <title>Email Campaigns - Admin Dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <EmailCampaignsListPage />
    </>
  );
}
