import PrivacyPolicy from '../components/pages/PrivacyPolicy';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const PrivacyPage = () => {
  return (
    <>
      <Seo
        title="Privacy Policy | AajExam"
        description="AajExam respects your privacy. Read how we collect, use, store and protect your personal information across the AajExam government exam preparation platform and mobile apps."
        canonical="/privacy"
        keywords={['aajexam privacy policy', 'data protection', 'data security', 'user privacy']}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy' }
        ])}
      />
      <PrivacyPolicy />
    </>
  );
};

export default PrivacyPage;
