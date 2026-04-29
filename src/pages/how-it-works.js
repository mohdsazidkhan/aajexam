import HowItWorks from '../components/pages/HowItWorks';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const HowItWorksPage = () => {
  return (
    <>
      <Seo
        title="How AajExam Works – Practice, Track, Refer & Earn"
        description="Learn how AajExam works: pick a government exam, attempt practice tests and previous year question papers (PYQs), track sectional performance and earn cash rewards by inviting friends to upgrade to PRO."
        canonical="/how-it-works"
        keywords={[
          'how aajexam works',
          'aajexam guide',
          'practice test platform',
          'PYQ practice',
          'refer and earn',
          'quiz leaderboard',
          'aajexam tutorial'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'How It Works', url: '/how-it-works' }
        ])}
      />
      <HowItWorks />
    </>
  );
};

export default HowItWorksPage;
