import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';

const AdminGovtExams = dynamic(() => import('../../../components/pages/admin/AdminGovtExams'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function GovtExamExams() {
  return (
    <>
      <Head>
        <title>Government Exams - Exams | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminGovtExams />
    </>
  );
}


