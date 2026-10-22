import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';

const AdminGovtExamTests = dynamic(() => import('../../../components/admin/pages/GovtExamTests'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function GovtExamTests() {
  return (
    <>
      <Head>
        <title>Government Exams - Tests | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminGovtExamTests />
    </>
  );
}


