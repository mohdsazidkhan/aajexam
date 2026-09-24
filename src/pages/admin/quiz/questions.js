import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
const AdminQuizQuestions = dynamic(() => import('../../../components/pages/admin/QuizQuestions'), { ssr: false, loading: () => <AdminTableSkeleton /> });
export default function Page() { return (<><Head><title>Questions | Admin - AajExam</title><meta name="robots" content="noindex,nofollow" /></Head><AdminQuizQuestions /></>); }
