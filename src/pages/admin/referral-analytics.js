import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminReferralAnalytics = dynamic(() => import('../../components/pages/admin/AdminReferralAnalytics'), {
    ssr: false,
    loading: () => <div>Loading...</div>
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
