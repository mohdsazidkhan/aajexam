import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminDashboardSkeleton } from '../../components/admin/Skeletons';

const AdminReferralAnalytics = dynamic(() => import('../../components/pages/admin/ReferralAnalytics'), {
    ssr: false,
    loading: () => <AdminDashboardSkeleton />
});

export default function AdminReferralAnalyticsPage() {
    return (
        <>
            <Head>
                <title>Admin Referral Analytics - SUBG</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <AdminReferralAnalytics />
        </>
    );
}
