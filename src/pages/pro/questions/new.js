import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const PostUserQuestion = dynamic(() => import('../../../components/pages/pro/PostUserQuestion'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function NewQuestion() {
  return (
    <>
      <Head>
        <title>Post New Question - AajExam Pro</title>
        <meta name="description" content="Post a new question to the AajExam community. Share your knowledge, create engaging questions, and help others learn." />
        <meta name="keywords" content="post question, new question, create question, AajExam community, share knowledge" />
        <meta property="og:title" content="Post New Question - AajExam Pro" />
        <meta property="og:description" content="Post a new question to the AajExam community and share your knowledge." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Post New Question - AajExam Pro" />
        <meta name="twitter:description" content="Share your knowledge by posting questions on AajExam Pro." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <PostUserQuestion />
      </Suspense>
    </>
  );
}
