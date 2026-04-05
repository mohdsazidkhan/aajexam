'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const QuestionsPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the public questions page
    router.replace('/questions/public');
  }, [router]);

  return (
    <>
      <Head>
        <title>Questions - AajExam</title>
        <meta name="description" content="Explore and answer questions from the AajExam community. Test your knowledge, help others learn, and contribute to the knowledge base." />
        <meta name="keywords" content="questions, quiz questions, knowledge questions, community questions, Q&A" />
        <meta property="og:title" content="Questions - AajExam Platform" />
        <meta property="og:description" content="Explore and answer questions from the AajExam community. Test your knowledge and help others learn." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Questions - AajExam Platform" />
        <meta name="twitter:description" content="Explore and answer questions from the AajExam community." />
      </Head>
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to questions...</p>
        </div>
      </div>
    </>
  );
};

export default QuestionsPage;

