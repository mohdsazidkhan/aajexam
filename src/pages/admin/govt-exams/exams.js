import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminGovtExams = dynamic(() => import('../../../components/pages/admin/AdminGovtExams'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
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

