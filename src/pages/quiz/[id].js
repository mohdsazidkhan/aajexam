import dynamic from 'next/dynamic';
import Head from 'next/head';

const QuizPreviewPage = dynamic(() => import('../../components/pages/QuizPreviewPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function QuizPreview() {
  return (
    <>
      <Head>
        <title>Quiz - AajExam</title>
        <meta name="description" content="Take a quiz on AajExam and test your knowledge for government exam preparation." />
      </Head>
      <QuizPreviewPage />
    </>
  );
}
