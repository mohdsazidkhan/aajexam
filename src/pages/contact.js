import ContactUs from '../components/pages/ContactUs';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';
import config from '../lib/config/appConfig';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

const ContactPage = ({ contactInfo }) => {
  return (
    <>
      <Seo
        title="Contact AajExam – Support, Feedback & Partnerships"
        description={`Get in touch with the AajExam team for support with practice tests, PYQs, subscriptions or refer & earn. Email ${config.CONTACT.EMAIL} or call ${config.CONTACT.PHONE}.`}
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
              "email": config.CONTACT.EMAIL,
              "telephone": `+${config.CONTACT.PHONE.replace(/\D/g, '')}`,
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
        email: config.CONTACT.EMAIL,
        phone: config.CONTACT.PHONE,
        address: 'Badarpur, Delhi, India',
        businessHours: '24/7'
      }
    },
    revalidate: 86400
  };
}

export default ContactPage;
