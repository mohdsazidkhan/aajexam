import Head from 'next/head';
import AdminQuizRewardsHistory from '../../components/pages/admin/AdminQuizRewardsHistory';

export default function QuizRewardsHistoryPage() {
    return (
        <>
            <Head>
                <title>Quiz Rewards History - SUBG QUIZ Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <AdminQuizRewardsHistory />
        </>
    );
}
