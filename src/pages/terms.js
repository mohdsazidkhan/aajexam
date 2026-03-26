import TermsAndConditions from '../components/pages/TermsAndConditions';
import Head from 'next/head';

const TermsPage = () => {
  return (
    <>
      <Head>
        <title>Terms and Conditions - SUBG QUIZ Platform</title>
        <meta name="description" content="Read SUBG QUIZ's terms and conditions. Understand the rules, guidelines, and user agreements for using our quiz platform and services." />
        <meta name="keywords" content="terms and conditions, user agreement, terms of service, legal terms, usage policy" />
        <meta property="og:title" content="Terms and Conditions - SUBG QUIZ Platform" />
        <meta property="og:description" content="Read SUBG QUIZ's terms and conditions for using our platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms and Conditions - SUBG QUIZ" />
        <meta name="twitter:description" content="Understand SUBG QUIZ's terms of service and user agreements." />
      </Head>
      <TermsAndConditions />
    </>
  );
};

export default TermsPage;