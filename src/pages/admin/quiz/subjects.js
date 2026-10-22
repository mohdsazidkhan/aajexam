import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
const AdminQuizSubjects = dynamic(() => import('../../../components/admin/pages/QuizSubjects'), { ssr: false, loading: () => <AdminTableSkeleton /> });
export default function Page() { return (<><Head><title>Subjects | Admin - AajExam</title><meta name="robots" content="noindex,nofollow" /></Head><AdminQuizSubjects /></>); }
