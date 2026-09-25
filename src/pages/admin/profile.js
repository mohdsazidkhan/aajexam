import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../components/admin/Skeletons';

const AdminProfilePage = dynamic(() => import('../../components/pages/admin/AdminProfilePage'), {
  ssr: false,
  loading: () => <AdminDashboardSkeleton />
});

export default function AdminProfile() {
  return (
    <>
      <Head>
        <title>Profile - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminProfilePage />
    </>
  );
}
