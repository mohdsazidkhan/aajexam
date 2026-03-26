import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const SubcategoryPage = dynamic(() => import('../../components/pages/admin/SubcategoryPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function SubcategoriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubcategoryPage />
    </Suspense>
  );
}
