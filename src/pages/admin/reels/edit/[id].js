import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminFormSkeleton } from '../../../../components/skeletons/AdminSkeletons';

const AdminReelEdit = dynamic(() => import('../../../../components/pages/admin/AdminReelEdit'), {
  ssr: false,
  loading: () => <AdminFormSkeleton />
});

export default function AdminReelEditPage() {
  return (
    <>
      <Head>
        <title>Edit Reel | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminReelEdit />
    </>
  );
}
