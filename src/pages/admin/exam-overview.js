import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../components/skeletons/AdminSkeletons';

const ExamOverviewPage = dynamic(() => import('../../components/pages/admin/ExamOverviewPage'), {
  ssr: false,
  loading: () => <AdminDashboardSkeleton />
});

export default function ExamOverview() {
  return (
    <>
      <Head>
        <title>Exam Overview - Admin | AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <ExamOverviewPage />
    </>
  );
}
