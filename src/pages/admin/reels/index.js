import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';

const AdminReels = dynamic(() => import('../../../components/pages/admin/AdminReels'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminReelsPage() {
  return (
    <>
      <Head>
        <title>Reels Management | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminReels />
    </>
  );
}
