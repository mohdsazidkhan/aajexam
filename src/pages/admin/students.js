import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../components/skeletons/AdminSkeletons';

const StudentsPageComponent = dynamic(() => import('../../components/pages/admin/StudentsPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function StudentsPage() {
  return (
    <>
      <Head>
        <title>Admin Students - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <StudentsPageComponent />
    </>
  );
}
