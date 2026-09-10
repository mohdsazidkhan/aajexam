import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AdminFormSkeleton } from '../../../components/skeletons/AdminSkeletons';

const EmailCampaignBuilder = dynamic(() => import('../../../components/pages/admin/EmailCampaignBuilder'), {
  ssr: false,
  loading: () => <AdminFormSkeleton />
});

export default function EditEmailCampaign() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Edit Campaign - Admin Dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      {/* Wait for the router so the id is available on first client render. */}
      {router.isReady ? <EmailCampaignBuilder campaignId={id} /> : <div className="p-4 lg:p-8"><AdminFormSkeleton /></div>}
    </>
  );
}
