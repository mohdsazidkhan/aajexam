import TermsAndConditions from '../components/pages/TermsAndConditions';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const TermsPage = () => {
  return (
    <>
      <Seo
        title="Terms & Conditions | AajExam"
        description="Read AajExam's terms and conditions covering platform usage, subscription policies, refer & earn, content rights and user responsibilities for the AajExam government exam preparation platform."
        canonical="/terms"
        keywords={['aajexam terms', 'terms and conditions', 'user agreement', 'terms of service']}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Terms and Conditions', url: '/terms' }
        ])}
      />
      <TermsAndConditions />
    </>
  );
};

export default TermsPage;
