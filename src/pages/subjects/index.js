import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema } from '../../utils/schema';

const SubjectListPage = dynamic(() => import('../../components/pages/SubjectListPage'), { ssr: false, loading: () => <div>Loading...</div> });

export default function Subjects() {
  return (
    <>
      <Seo
        title="Subjects – Reasoning, Maths, English, GA & GK Practice | AajExam"
        description="Browse subject-wise practice on AajExam: Reasoning, Quantitative Aptitude, English Language, General Awareness, General Knowledge and Current Affairs for SSC, UPSC, Banking and Railway exams."
        canonical="/subjects"
        keywords={[
          'reasoning practice',
          'quantitative aptitude practice',
          'english language quiz',
          'general awareness mcq',
          'general knowledge quiz',
          'subject wise mcq',
          'aajexam subjects'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Subjects', url: '/subjects' }
        ])}
      />
      <SubjectListPage />
    </>
  );
}
