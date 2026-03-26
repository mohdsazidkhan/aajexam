import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getCurrentUser } from '../../utils/authUtils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Loading from '../../components/Loading';

const UserWithdrawalHistory = dynamic(() => import('../../components/pages/pro/UserWithdrawalHistory'), {
    ssr: false,
    loading: () => <Loading fullPage />
});

export default function WithdrawalHistoryPage() {
    const router = useRouter();
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        if (!user) {
            router.push('/login?redirect=/pro/withdrawal-history');
        } else {
            setAuthReady(true);
        }
    }, [router]);

    if (!authReady) return <Loading fullPage />;

    return (
        <>
            <Head>
                <title>Withdrawal History | AajExam</title>
                <meta name="description" content="View and track your withdrawal requests history." />
            </Head>
            <UserWithdrawalHistory />
        </>
    );
}
