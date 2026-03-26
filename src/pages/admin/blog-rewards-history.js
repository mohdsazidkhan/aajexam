import Head from 'next/head';
import BlogRewardsHistory from '../../components/pages/admin/BlogRewardsHistory';

export default function BlogRewardsHistoryPage() {
  return (
    <>
      <Head>
        <title>Blog Rewards History - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <BlogRewardsHistory />
    </>
  );
}

