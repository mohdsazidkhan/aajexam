import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/skeletons/AdminSkeletons';

const StudentsPage = dynamic(() => import('../../components/pages/admin/StudentsPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function AdminUsersPage() {
  return (
    <>
      <Head>
        <title>Admin Users - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <StudentsPage />
    </>
  );
}
