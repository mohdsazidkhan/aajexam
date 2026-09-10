import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';
const AdminQuizQuestions = dynamic(() => import('../../../components/pages/admin/AdminQuizQuestions'), { ssr: false, loading: () => <AdminTableSkeleton /> });
export default function Page() { return (<><Head><title>Questions | Admin - AajExam</title><meta name="robots" content="noindex,nofollow" /></Head><AdminQuizQuestions /></>); }
