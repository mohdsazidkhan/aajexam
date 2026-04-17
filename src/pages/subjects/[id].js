import dynamic from 'next/dynamic';
import Head from 'next/head';

const SubjectDetailPage = dynamic(() => import('../../components/pages/SubjectDetailPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function SubjectDetail() {
  return (
    <>
      <Head>
        <title>Subject - AajExam</title>
      </Head>
      <SubjectDetailPage />
    </>
  );
}
