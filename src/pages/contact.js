import ContactUs from '../components/pages/ContactUs';
import Head from 'next/head';

const ContactPage = ({ contactInfo }) => {
  return (
    <>
      <Head>
        <title>Contact Us - AajExam Platform</title>
        <meta name="description" content="Get in touch with AajExam team. We're here to help with any questions, feedback, or support you need. Reach out to us anytime!" />
        <meta name="keywords" content="contact, support, help, feedback, AajExam contact" />
        <meta property="og:title" content="Contact Us - AajExam Platform" />
        <meta property="og:description" content="Get in touch with AajExam team. We're here to help with any questions, feedback, or support you need." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us - AajExam Platform" />
        <meta name="twitter:description" content="Get in touch with AajExam team. We're here to help with any questions, feedback, or support you need." />
        <meta name="robots" content="index, follow" />
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
