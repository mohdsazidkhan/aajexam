import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const CreateUserQuiz = dynamic(() => import('../../../components/pages/pro/CreateUserQuiz'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function CreateQuiz() {
  return (
    <>
      <Head>
        <title>Create Quiz - SUBG QUIZ Pro</title>
        <meta name="description" content="Create your own quiz on SUBG QUIZ Pro. Design custom quizzes with your questions and share them with the community. Earn rewards for popular quizzes." />
        <meta name="keywords" content="create quiz, make quiz, custom quiz, quiz creator, pro user quiz" />
        <meta property="og:title" content="Create Quiz - SUBG QUIZ Pro" />
        <meta property="og:description" content="Create your own quiz on SUBG QUIZ Pro and share with the community." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Create Quiz - SUBG QUIZ Pro" />
        <meta name="twitter:description" content="Create custom quizzes on SUBG QUIZ Pro." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <CreateUserQuiz />
      </Suspense>
    </>
  );
}
