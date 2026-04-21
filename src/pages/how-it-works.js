import HowItWorks from '../components/pages/HowItWorks';
import Head from 'next/head';
import { generateBreadcrumbSchema, renderSchema } from '../utils/schema';

const HowItWorksPage = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
  return (
    <>
      <Head>
        <title>How It Works - AajExam</title>
        <meta name="description" content="Learn how AajExam works. Discover how to take quizzes, earn points, compete on leaderboards, level up, and earn cash rewards by referring friends to PRO." />
        <meta name="keywords" content="how it works, user guide, getting started, quiz platform guide, AajExam tutorial, refer and earn, referral rewards" />
        <link rel="canonical" href={`${siteUrl}/how-it-works`} />
        <meta property="og:title" content="How It Works - AajExam Platform" />
        <meta property="og:description" content="Learn how AajExam works and how to get started with quizzes and rewards." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AajExam" />
        <meta property="og:url" content={`${siteUrl}/how-it-works`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@AajExam" />
        <meta name="twitter:title" content="How It Works - AajExam" />
        <meta name="twitter:description" content="Discover how to use AajExam and earn rewards." />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />
        {renderSchema(generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'How It Works' }
        ]))}
      </Head>
      <HowItWorks />
    </>
  );
};

export default HowItWorksPage;
