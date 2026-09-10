import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminFormSkeleton } from '../../../components/skeletons/AdminSkeletons';

const EmailCampaignBuilder = dynamic(() => import('../../../components/pages/admin/EmailCampaignBuilder'), {
  ssr: false,
  loading: () => <AdminFormSkeleton />
});

export default function NewEmailCampaign() {
  return (
    <>
      <Head>
        <title>New Campaign - Admin Dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <EmailCampaignBuilder />
    </>
  );
}
