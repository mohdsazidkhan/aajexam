import dynamic from 'next/dynamic';
import Head from 'next/head';

const AdminUserAnalyticsDetail = dynamic(() => import('../../../../components/pages/admin/AdminUserAnalyticsDetail'), {
    ssr: false,
    loading: () => <div>Loading...</div>
});

export default function UserAnalyticsDetailPage() {
    return (
        <>
            <Head>
                <title>User Analytics - SUBG Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <AdminUserAnalyticsDetail />
        </>
    );
}
