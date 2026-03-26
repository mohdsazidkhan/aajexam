import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../../utils/authUtils';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const BlogRewardsHistory = dynamic(() => import('../../components/pages/pro/BlogRewardsHistory.jsx'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading Rewards History...</div>
});

export default function BlogRewardsHistoryPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Blog Rewards History - AajExam Platform</title>
        <meta name="description" content="View your historical earnings from approved blogs on AajExam." />
      </Head>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <BlogRewardsHistory />
      </Suspense>
    </>
  );
}

