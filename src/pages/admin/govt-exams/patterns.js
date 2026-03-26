import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminGovtExamPatterns = dynamic(() => import('../../../components/pages/admin/AdminGovtExamPatterns'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
});

export default function GovtExamPatterns() {
  return (
    <>
      <Head>
        <title>Government Exams - Patterns | Admin - SUBG QUIZ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminGovtExamPatterns />
    </>
  );
}

