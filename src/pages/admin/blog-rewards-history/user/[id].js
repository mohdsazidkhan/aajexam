import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const UserBlogRewardsHistory = dynamic(() => import('../../../../components/pages/admin/UserBlogRewardsHistory'), {
  ssr: false,
});

export default function UserBlogRewardsHistoryPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>User Blog Rewards History - AajExam Admin</title>
        <meta name="description" content="View user-specific blog rewards history" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <UserBlogRewardsHistory userId={id} />
    </>
  );
}

