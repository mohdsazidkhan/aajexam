import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminGovtExamResults = dynamic(() => import('../../../components/pages/admin/AdminGovtExamResults'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div></div>
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

