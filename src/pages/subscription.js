import dynamic from 'next/dynamic';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const SubscriptionPage = dynamic(() => import('../components/pages/SubscriptionPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Subscription() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "AajExam Pro",
    "description": "Unlock all premium practice tests, full PYQ archive, advanced analytics and ad-free practice for SSC, UPSC, Banking, Railway and State PSC exams on AajExam Pro.",
    "brand": { "@type": "Brand", "name": "AajExam" },
    "image": (process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com') + "/logo.png",
    "offers": {
      "@type": "Offer",
      "price": process.env.NEXT_PUBLIC_PLAN_PRICE_PRO || "99",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": (process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com') + "/subscription"
    }
  };

  return (
    <>
      <Seo
        title="AajExam Pro – Unlock All Practice Tests, PYQs & Analytics"
        description="Upgrade to AajExam Pro for unlimited practice tests, full PYQ archive, sectional analytics, ad-free practice and Pro mentor access. Affordable monthly plans for SSC, UPSC, Banking, Railway and State PSC aspirants."
        canonical="/subscription"
        keywords={[
          'aajexam pro',
          'aajexam subscription',
          'aajexam pricing',
          'pro plan',
          'sarkari exam pro plan',
          'unlimited mock tests'
        ]}
        schemas={[
          productSchema,
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Subscription Plans', url: '/subscription' }
          ])
        ]}
      />
      <SubscriptionPage />
    </>
  );
}
