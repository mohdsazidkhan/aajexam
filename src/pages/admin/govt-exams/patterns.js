import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';

const AdminGovtExamPatterns = dynamic(() => import('../../../components/pages/admin/AdminGovtExamPatterns'), {
  ssr: false,
  loading: () => <AdminTableSkeleton />
});

export default function GovtExamPatterns() {
  return (
    <>
      <Head>
        <title>Government Exams - Patterns | Admin - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminGovtExamPatterns />
    </>
  );
}


