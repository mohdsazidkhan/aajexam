import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/admin/Skeletons';
import AdminRoute from '../../components/admin/Route';

const AdminsPage = dynamic(() => import('../../components/admin/pages/AdminsPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminAdminsPage() {
  return (
    <AdminRoute>
      <Head>
        <title>Admins - Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminsPage />
    </AdminRoute>
  );
}
