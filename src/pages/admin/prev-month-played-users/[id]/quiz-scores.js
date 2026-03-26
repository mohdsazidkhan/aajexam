import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const AdminUserQuizScores = dynamic(() => import('../../../../components/pages/admin/AdminUserQuizScores'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminUserQuizScoresPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>User Quiz Scores - Admin - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        {id && <AdminUserQuizScores userId={id} />}
      </Suspense>
    </>
  );
}

