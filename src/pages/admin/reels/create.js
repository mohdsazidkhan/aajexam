import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminFormSkeleton } from '../../../components/admin/Skeletons';

const AdminReelCreate = dynamic(() => import('../../../components/pages/admin/ReelCreate'), {
  ssr: false,
  loading: () => <AdminFormSkeleton />
});

export default function AdminReelCreatePage() {
  return (
    <>
      <Head>
        <title>Create Reel | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminReelCreate />
    </>
  );
}
