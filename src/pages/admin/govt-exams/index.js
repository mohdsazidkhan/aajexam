import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';

const AdminGovtExamCategories = dynamic(() => import('../../../components/pages/admin/AdminGovtExamCategories'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function GovtExams() {
  return (
    <>
      <Head>
        <title>Government Exams - Categories | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminGovtExamCategories />
    </>
  );
}


