import dynamic from 'next/dynamic';
import Head from 'next/head';

const QuizResultDetail = dynamic(() => import('../../components/pages/QuizResultDetail'), { ssr: false, loading: () => <div>Loading...</div> });

export default function QuizResultPage() {
  return (
    <>
      <Head>
        <title>Quiz Result - AajExam</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <QuizResultDetail />
    </>
  );
}
