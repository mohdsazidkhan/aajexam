import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';

const EmailCampaignsListPage = dynamic(() => import('../../../components/admin/pages/EmailCampaignsListPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
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
