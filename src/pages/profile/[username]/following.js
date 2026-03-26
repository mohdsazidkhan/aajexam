import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const FollowingList = dynamic(() => import('../../../components/FollowingList'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function FollowingListPage() {
  const router = useRouter();
  const { username } = router.query;

  return (
    <>
      <Head>
        <title>Following - SUBG QUIZ Platform</title>
        <meta name="description" content="View who this user is following on SUBG QUIZ. Explore the profiles they follow and discover new users." />
        <meta name="keywords" content="following, user following, following list, SUBG QUIZ following" />
        <meta property="og:title" content="Following - SUBG QUIZ Platform" />
        <meta property="og:description" content="View user's following list on SUBG QUIZ Platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Following - SUBG QUIZ" />
        <meta name="twitter:description" content="View following list on SUBG QUIZ Platform." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <FollowingList username={username} />
      </Suspense>
    </>
  );
}
