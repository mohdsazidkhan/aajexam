import ContactUs from '../components/pages/ContactUs';
import Head from 'next/head';
import { generateBreadcrumbSchema, renderSchema } from '../utils/schema';

const ContactPage = ({ contactInfo }) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
  return (
    <>
      <Head>
        <title>Contact Us - AajExam Platform</title>
        <meta name="description" content="Get in touch with AajExam team. We're here to help with any questions, feedback, or support you need. Reach out to us anytime!" />
        <meta name="keywords" content="contact AajExam, support, help, feedback, customer service, government exam help" />
        <link rel="canonical" href={`${siteUrl}/contact`} />
        <meta property="og:title" content="Contact Us - AajExam Platform" />
        <meta property="og:description" content="Get in touch with AajExam team. We're here to help with any questions, feedback, or support you need." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AajExam" />
        <meta property="og:url" content={`${siteUrl}/contact`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@AajExam" />
        <meta name="twitter:title" content="Contact Us - AajExam Platform" />
        <meta name="twitter:description" content="Get in touch with AajExam team. We're here to help with any questions, feedback, or support you need." />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />
        <meta name="robots" content="index, follow" />
        {renderSchema(generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Contact Us' }
        ]))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact AajExam",
          "url": `${siteUrl}/contact`,
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
        })}} />
      </Head>
      <ContactUs contactInfo={contactInfo} />
    </>
  );
};

// Server-side props to ensure contact information is in HTML source
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
    revalidate: 86400 // Revalidate once per day
  };
}

export default ContactPage;
