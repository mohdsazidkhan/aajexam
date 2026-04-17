import dynamic from 'next/dynamic';
import Head from 'next/head';

const QuizListPage = dynamic(() => import('../components/pages/QuizListPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function Quizzes() {
  return (
    <>
      <Head>
        <title>Quizzes - AajExam</title>
        <meta name="description" content="Practice quizzes for government exam preparation on AajExam." />
      </Head>
      <QuizListPage />
    </>
  );
}
