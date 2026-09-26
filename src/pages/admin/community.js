import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';
import AdminRoute from '../../components/admin/Route';

const CommunityModeration = dynamic(() => import('../../components/pages/admin/CommunityModeration'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminCommunityPage() {
  return (
    <AdminRoute>
      <Head>
        <title>Community Q&A Moderation - Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <CommunityModeration />
    </AdminRoute>
  );
}
