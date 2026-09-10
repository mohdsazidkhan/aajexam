import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';
const AdminQuizSubjects = dynamic(() => import('../../../components/pages/admin/AdminQuizSubjects'), { ssr: false, loading: () => <AdminTableSkeleton /> });
export default function Page() { return (<><Head><title>Subjects | Admin - AajExam</title><meta name="robots" content="noindex,nofollow" /></Head><AdminQuizSubjects /></>); }
