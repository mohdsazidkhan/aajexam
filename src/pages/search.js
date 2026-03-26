import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const SearchPage = dynamic(() => import('../components/pages/SearchPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Search() {
  return (
    <>
      <Head>
        <title>Search - SUBG QUIZ</title>
        <meta name="description" content="Search for quizzes, questions, articles, users, and categories on SUBG QUIZ. Find the content you're looking for and discover new knowledge areas." />
        <meta name="keywords" content="search, find quizzes, search questions, search users, search articles, quiz search" />
        <meta property="og:title" content="Search - SUBG QUIZ Platform" />
        <meta property="og:description" content="Search for quizzes, questions, and more on SUBG QUIZ." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Search - SUBG QUIZ" />
        <meta name="twitter:description" content="Search for content on SUBG QUIZ Platform." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchPage />
      </Suspense>
    </>
  );
}
