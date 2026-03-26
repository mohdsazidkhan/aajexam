import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const CategoryPage = dynamic(() => import('../../components/pages/admin/CategoryPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function CategoriesPage() {
  return (
    <>
      <Head>
        <title>Admin Categories - SUBG QUIZ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <CategoryPage />
      </Suspense>
    </>
  );
}
