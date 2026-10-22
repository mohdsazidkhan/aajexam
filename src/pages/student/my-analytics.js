import { AnalyticsPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Seo from '../../components/common/Seo';

const MyAnalyticsPage = dynamic(() => import('../../components/student/pages/UserAnalyticsPage'), {
  ssr: false,
  loading: () => <AnalyticsPageSkeleton />
});

export default function MyAnalytics() {
  return (
    <>
      <Seo
        title="My Analytics - AajExam Platform"
        description="View your comprehensive analytics on AajExam Platform. Track your earnings, expenses, performance metrics, and content creation statistics."
        noIndex={true}
      />
      <MyAnalyticsPage />
    </>
  );
}

