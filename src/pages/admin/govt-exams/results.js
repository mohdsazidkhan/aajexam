import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';

const AdminGovtExamResults = dynamic(() => import('../../../components/pages/admin/AdminGovtExamResults'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function GovtExamResults() {
  return (
    <>
      <Head>
        <title>Government Exams - Results | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminGovtExamResults />
    </>
  );
}


