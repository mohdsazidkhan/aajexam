import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
const AdminQuizQuizzes = dynamic(() => import('../../../components/pages/admin/QuizQuizzes'), { ssr: false, loading: () => <AdminTableSkeleton /> });
export default function Page() { return (<><Head><title>Quizzes | Admin - AajExam</title><meta name="robots" content="noindex,nofollow" /></Head><AdminQuizQuizzes /></>); }
