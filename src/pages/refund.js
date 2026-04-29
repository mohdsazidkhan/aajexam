import RefundPolicy from '../components/pages/RefundPolicy';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const RefundPage = () => {
  return (
    <>
      <Seo
        title="Refund & Cancellation Policy | AajExam"
        description="Read AajExam's refund and cancellation policy for Pro subscriptions and PayU payments. Understand eligibility, processing time and how to raise a refund request."
        canonical="/refund"
        keywords={['aajexam refund', 'cancellation policy', 'subscription refund', 'PayU refund']}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Refund Policy', url: '/refund' }
        ])}
      />
      <RefundPolicy />
    </>
  );
};

export default RefundPage;
