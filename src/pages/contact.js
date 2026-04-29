import ContactUs from '../components/pages/ContactUs';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

const ContactPage = ({ contactInfo }) => {
  return (
    <>
      <Seo
        title="Contact AajExam – Support, Feedback & Partnerships"
        description="Get in touch with the AajExam team for support with practice tests, PYQs, subscriptions or refer & earn. Email support@mohdsazidkhan.com or call +91 7678 13 1912."
        canonical="/contact"
        keywords={[
          'contact AajExam',
          'aajexam support',
          'aajexam help',
          'government exam preparation help',
          'aajexam partnership'
        ]}
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Contact Us', url: '/contact' }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact AajExam",
            "url": `${SITE_URL}/contact`,
            "mainEntity": {
              "@type": "Organization",
              "name": "AajExam",
              "email": "support@mohdsazidkhan.com",
              "telephone": "+917678131912",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Delhi",
                "addressCountry": "IN"
              }
            }
          }
        ]}
      />
      <ContactUs contactInfo={contactInfo} />
    </>
  );
};

export async function getStaticProps() {
  return {
    props: {
      contactInfo: {
        email: 'support@mohdsazidkhan.com',
        phone: '+91 7678 13 1912',
        address: 'Badarpur, Delhi, India',
        businessHours: 'Mon - Fri: 9:00 AM - 9:00 PM'
      }
    },
    revalidate: 86400
  };
}

export default ContactPage;
