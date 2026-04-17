import dynamic from 'next/dynamic';
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
        <title>Following - AajExam Platform</title>
        <meta name="description" content="View who this user is following on AajExam. Explore the profiles they follow and discover new users." />
        <meta name="keywords" content="following, user following, following list, AajExam following" />
        <meta property="og:title" content="Following - AajExam Platform" />
        <meta property="og:description" content="View user's following list on AajExam Platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Following - AajExam" />
        <meta name="twitter:description" content="View following list on AajExam Platform." />
      </Head>
      <FollowingList username={username} />
    </>
  );
}
