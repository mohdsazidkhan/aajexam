import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AdminUserQuizzes = dynamic(() => import('../../components/pages/admin/AdminUserQuizzes'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminUserQuizzesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminUserQuizzes />
    </Suspense>
  );
}
