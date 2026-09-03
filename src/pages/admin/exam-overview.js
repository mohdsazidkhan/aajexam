import dynamic from 'next/dynamic';
import Head from 'next/head';

const ExamOverviewPage = dynamic(() => import('../../components/pages/admin/ExamOverviewPage'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
