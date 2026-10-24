import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';

const StudentEditPage = dynamic(() => import('../../../components/admin/pages/StudentEditPage'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function StudentEditRoute() {
  const router = useRouter();
  const { id } = router.query;
  return (
    <>
      <Head>
        <title>Edit Student - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      {id ? <StudentEditPage studentId={id} /> : <AdminTableSkeleton />}
    </>
  );
}
