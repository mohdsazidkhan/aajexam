import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../components/admin/Skeletons';

const ExamOverviewPage = dynamic(() => import('../../components/admin/pages/ExamOverviewPage'), {
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
