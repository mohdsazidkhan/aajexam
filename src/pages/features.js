import FeaturesPage from '../components/pages/FeaturesPage';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const Features = () => {
  return (
    <>
      <Seo
        title="Free vs PRO Features – AajExam"
        description="See every AajExam feature side-by-side: Free vs PRO. Practice tests, PYQ papers, mock exams, study planner, analytics, mentors and more — know exactly what's free and what unlocks with PRO."
        canonical="/features"
        keywords={[
          'aajexam features',
          'aajexam free vs pro',
          'aajexam pro plan',
          'aajexam pricing',
          'government exam practice features',
          'aajexam subscription features'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Features', url: '/features' }
        ])}
      />
      <FeaturesPage />
    </>
  );
};

export default Features;
