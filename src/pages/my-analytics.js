import dynamic from 'next/dynamic';
import Head from 'next/head';
import Seo from '../components/Seo';
import { DashboardSkeleton } from '../components/skeletons/PrivateSkeletons';

const MyAnalyticsPage = dynamic(() => import('../components/pages/UserAnalyticsPage'), {
  ssr: false,
  loading: () => <DashboardSkeleton />
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

