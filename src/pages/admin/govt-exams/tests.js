import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminGovtExamTests = dynamic(() => import('../../../components/pages/admin/AdminGovtExamTests'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
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

