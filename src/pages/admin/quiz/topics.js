import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
const AdminQuizTopics = dynamic(() => import('../../../components/pages/admin/QuizTopics'), { ssr: false, loading: () => <AdminTableSkeleton /> });
export default function Page() { return (<><Head><title>Topics | Admin - AajExam</title><meta name="robots" content="noindex,nofollow" /></Head><AdminQuizTopics /></>); }
