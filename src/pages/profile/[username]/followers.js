import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const FollowersList = dynamic(() => import('../../../components/FollowersList'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function FollowersListPage() {
  const router = useRouter();
  const { username } = router.query;

  return (
    <>
      <Head>
        <title>Followers - SUBG QUIZ Platform</title>
        <meta name="description" content="View user's followers on SUBG QUIZ. See who follows this user and explore their profiles." />
        <meta name="keywords" content="followers, user followers, follower list, SUBG QUIZ followers" />
        <meta property="og:title" content="Followers - SUBG QUIZ Platform" />
        <meta property="og:description" content="View user's followers on SUBG QUIZ Platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Followers - SUBG QUIZ" />
        <meta name="twitter:description" content="View follower list on SUBG QUIZ Platform." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <FollowersList username={username} />
      </Suspense>
    </>
  );
}
