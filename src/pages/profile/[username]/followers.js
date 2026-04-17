import dynamic from 'next/dynamic';
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
        <title>Followers - AajExam Platform</title>
        <meta name="description" content="View user's followers on AajExam. See who follows this user and explore their profiles." />
        <meta name="keywords" content="followers, user followers, follower list, AajExam followers" />
        <meta property="og:title" content="Followers - AajExam Platform" />
        <meta property="og:description" content="View user's followers on AajExam Platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Followers - AajExam" />
        <meta name="twitter:description" content="View follower list on AajExam Platform." />
      </Head>
      <FollowersList username={username} />
    </>
  );
}
