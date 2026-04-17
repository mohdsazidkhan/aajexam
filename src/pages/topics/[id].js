import dynamic from 'next/dynamic';
import Head from 'next/head';

const TopicDetailPage = dynamic(() => import('../../components/pages/TopicDetailPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function TopicDetail() {
  return (
    <>
      <Head>
        <title>Topic - AajExam</title>
      </Head>
      <TopicDetailPage />
    </>
  );
}
