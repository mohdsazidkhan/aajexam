import dynamic from 'next/dynamic';
import Head from 'next/head';

const StudentsPageComponent = dynamic(() => import('../../components/pages/admin/StudentsPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function StudentsPage() {
  return (
    <>
      <Head>
        <title>Admin Students - AajExam</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <StudentsPageComponent />
    </>
  );
}
